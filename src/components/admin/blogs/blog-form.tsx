"use client"

import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import RichTextEditor from "./rich-text-editor"

type BlogStatus = "draft" | "published"

export interface BlogFormData {
  _id?: string
  title: string
  slug?: string
  excerpt: string
  content: string
  coverImage?: string
  author: string
  tags: string[]
  status: BlogStatus
}

interface BlogFormProps {
  mode: "create" | "edit"
  initialData?: BlogFormData
}

export default function BlogForm({ mode, initialData }: BlogFormProps) {
  const router = useRouter()
  const coverImageInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState(initialData?.title || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "")
  const [author, setAuthor] = useState(initialData?.author || "")
  const [tags, setTags] = useState((initialData?.tags || []).join(", "))
  const [status, setStatus] = useState<BlogStatus>(initialData?.status || "draft")

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = () => reject(new Error("Failed to read image file"))
      reader.readAsDataURL(file)
    })

  const handleCoverImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.")
        return
      }
      setError("")
      const dataUrl = await fileToDataUrl(file)
      setCoverImage(dataUrl)
    } catch (uploadError) {
      console.error(uploadError)
      setError("Unable to upload cover image. Please try again.")
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      title,
      excerpt,
      content,
      coverImage,
      author,
      tags: tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status,
    }

    try {
      const url = mode === "create" ? "/api/admin/blogs" : `/api/admin/blogs/${initialData?._id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to save blog")
        return
      }

      router.push("/admin/blogs")
      router.refresh()
    } catch (saveError) {
      setError("Unexpected error while saving blog")
      console.error(saveError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-4xl">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        className="border rounded px-3 py-2 !bg-white !text-black placeholder:text-gray-500 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="border rounded px-3 py-2 w-full min-h-[90px] !bg-white !text-black placeholder:text-gray-500"
        placeholder="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        required
      />

      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write blog content... Use toolbar for headings, lists, links, and upload images from your device."
      />
      <p className="text-xs text-gray-600">Use the image button in toolbar to upload images from local device.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <input ref={coverImageInputRef} type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
          <button
            type="button"
            className="border rounded px-3 py-2 !bg-white !text-black w-full text-left"
            onClick={() => coverImageInputRef.current?.click()}
          >
            {coverImage ? "Change Cover Image (Local Device)" : "Upload Cover Image (Local Device)"}
          </button>
          {coverImage && (
            <div className="space-y-2">
              <img src={coverImage} alt="Cover preview" className="h-24 w-full object-cover rounded border" />
              <button
                type="button"
                className="text-xs text-red-600 underline"
                onClick={() => setCoverImage("")}
              >
                Remove Cover Image
              </button>
            </div>
          )}
        </div>
        <input
          className="border rounded px-3 py-2 !bg-white !text-black placeholder:text-gray-500"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <input
          className="border rounded px-3 py-2 md:col-span-2 !bg-white !text-black placeholder:text-gray-500"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 !bg-white !text-black"
          value={status}
          onChange={(e) => setStatus(e.target.value as BlogStatus)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Saving..." : mode === "create" ? "Create Blog" : "Update Blog"}
      </button>
    </form>
  )
}
