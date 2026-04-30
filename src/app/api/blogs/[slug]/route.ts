import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel } from "@/models/blog"

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const connection = await connectProfileDB()
    const Blog = getBlogModel(connection)

    const blog = await Blog.findOne({ slug, status: "published" }).lean()
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, blog })
  } catch (error) {
    console.error("Error fetching blog by slug:", error)
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 })
  }
}
