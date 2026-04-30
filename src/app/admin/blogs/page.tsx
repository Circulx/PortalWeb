"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

interface BlogListItem {
  _id: string
  title: string
  slug: string
  status: "draft" | "published"
  author: string
  updatedAt: string
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")

  const fetchBlogs = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (status !== "all") params.set("status", status)
    const res = await fetch(`/api/admin/blogs?${params.toString()}`)
    const data = await res.json()
    setBlogs(data.blogs || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const onDelete = async (id: string) => {
    const ok = window.confirm("Delete this blog?")
    if (!ok) return
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" })
    fetchBlogs()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blogs</h1>
          <p className="text-sm text-gray-600">Create and manage blog posts from admin.</p>
        </div>
        <Link href="/admin/blogs/new" className="bg-black text-white px-4 py-2 rounded w-fit">
          New Blog
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="border rounded px-3 py-2 md:w-80 bg-white text-black"
          placeholder="Search by title, excerpt, author"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2 md:w-48 bg-white text-black"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button className="border rounded px-3 py-2" onClick={fetchBlogs}>
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-gray-600">No blogs found.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Title</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Author</th>
                <th className="text-left px-3 py-2">Updated</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium">{blog.title}</p>
                    <p className="text-xs text-gray-500">/{blog.slug}</p>
                  </td>
                  <td className="px-3 py-2 capitalize">{blog.status}</td>
                  <td className="px-3 py-2">{blog.author}</td>
                  <td className="px-3 py-2">{new Date(blog.updatedAt).toLocaleString()}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <Link
                      href={`/admin/blogs/${blog._id}`}
                      className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100"
                      aria-label="Edit blog"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-gray-700" />
                    </Link>
                    <button
                      className="inline-flex items-center justify-center p-1 rounded hover:bg-red-50"
                      onClick={() => onDelete(blog._id)}
                      aria-label="Delete blog"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
