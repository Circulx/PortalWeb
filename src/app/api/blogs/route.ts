import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel } from "@/models/blog"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") || "10", 10), 1), 30)
    const q = searchParams.get("q")?.trim()

    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)

    const query: Record<string, unknown> = { status: "published" }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ]
    }

    const [items, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title slug excerpt coverImage author tags publishedAt createdAt")
        .lean(),
      Blog.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      blogs: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    })
  } catch (error) {
    console.error("Error fetching public blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}
