import { notFound } from "next/navigation"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel } from "@/models/blog"
import BlogForm from "@/components/admin/blogs/blog-form"
import mongoose from "mongoose"

async function getBlogById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  const connection = await connectProfileDB()
  const Blog = getBlogModel(connection)
  const blog = await Blog.findById(id).lean()
  if (!blog) return null

  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage || "",
    author: blog.author,
    tags: blog.tags || [],
    status: blog.status,
    publishedAt: blog.publishedAt || null,
  }
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blog = await getBlogById(id)

  if (!blog) {
    notFound()
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Edit Blog</h1>
        <p className="text-sm text-gray-600">Update content, status, metadata and republish.</p>
      </div>
      <BlogForm mode="edit" initialData={blog} />
    </div>
  )
}
