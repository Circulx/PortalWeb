import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel, type BlogStatus } from "@/models/blog"
import { revalidatePath } from "next/cache"
import { sendBlogNewsletter } from "@/lib/send-blog-newsletter"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function parseTags(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const q = searchParams.get("q")?.trim()

    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)

    const query: Record<string, unknown> = {}
    if (status === "draft" || status === "published") {
      query.status = status
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
      ]
    }

    const blogs = await Blog.find(query).sort({ updatedAt: -1 }).lean()
    return NextResponse.json({ success: true, blogs })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const title = String(body.title || "").trim()
    const excerpt = String(body.excerpt || "").trim()
    const content = String(body.content || "").trim()
    const author = String(body.author || user.name || "Admin").trim()
    const status = (body.status === "published" ? "published" : "draft") as BlogStatus
    const coverImage = String(body.coverImage || "").trim()
    const tags = parseTags(body.tags)
    const baseSlug = slugify(String(body.slug || title))

    if (!title || !excerpt || !content || !baseSlug) {
      return NextResponse.json({ error: "title, excerpt and content are required" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)

    let slug = baseSlug
    let suffix = 1
    while (await Blog.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const publishedAt =
      status === "published" ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      author,
      tags,
      status,
      publishedAt,
    })

    revalidatePath("/blog")
    revalidatePath(`/blog/${slug}`)

    // Await newsletter so it isn't killed when the request context closes
    if (status === "published") {
      await sendBlogNewsletter({
        title: blog.title,
        excerpt: blog.excerpt,
        slug: blog.slug,
        author: blog.author,
        coverImage: blog.coverImage,
        tags: blog.tags,
        publishedAt: blog.publishedAt,
      })
    }

    return NextResponse.json({ success: true, blog }, { status: 201 })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}