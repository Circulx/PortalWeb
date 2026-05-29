import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel, type BlogStatus } from "@/models/blog"
import { revalidatePath } from "next/cache"
import mongoose from "mongoose"

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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog id" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)
    const blog = await Blog.findById(id).lean()

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, blog })
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog id" }, { status: 400 })
    }

    const body = await request.json()
    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)

    const current = await Blog.findById(id)
    if (!current) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    const title = body.title ? String(body.title).trim() : current.title
    const rawExcerpt = body.excerpt ? String(body.excerpt).trim() : current.excerpt
    const excerpt = rawExcerpt.length > 497 ? rawExcerpt.slice(0, 497).replace(/\s+\S*$/, "") + "..." : rawExcerpt
    const content = body.content ? String(body.content).trim() : current.content
    const author = body.author ? String(body.author).trim() : current.author
    const coverImage = body.coverImage !== undefined ? String(body.coverImage || "").trim() : current.coverImage
    const status = (body.status === "published" ? "published" : "draft") as BlogStatus
    const tags = body.tags !== undefined ? parseTags(body.tags) : current.tags

    const requestedSlug = body.slug ? slugify(String(body.slug)) : slugify(title)
    let slug = requestedSlug || current.slug

    if (slug !== current.slug) {
      let suffix = 1
      const baseSlug = slug
      while (await Blog.exists({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${suffix}`
        suffix += 1
      }
    }

    const publishedAt =
      status === "published"
        ? body.publishedAt
          ? new Date(body.publishedAt)
          : current.publishedAt || new Date()
        : null

    current.title = title
    current.slug = slug
    current.excerpt = excerpt
    current.content = content
    current.author = author
    current.coverImage = coverImage
    current.tags = tags
    current.status = status
    current.publishedAt = publishedAt

    await current.save()

    revalidatePath("/blog")
    revalidatePath(`/blog/${current.slug}`)

    return NextResponse.json({ success: true, blog: current })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog id" }, { status: 400 })
    }

    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)
    const deleted = await Blog.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    revalidatePath("/blog")
    revalidatePath(`/blog/${deleted.slug}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}