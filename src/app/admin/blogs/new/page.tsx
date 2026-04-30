import BlogForm from "@/components/admin/blogs/blog-form"

export default function NewBlogPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Create Blog</h1>
        <p className="text-sm text-gray-600">Write a new post and keep it draft or publish now.</p>
      </div>
      <BlogForm mode="create" />
    </div>
  )
}
