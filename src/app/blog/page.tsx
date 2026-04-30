import Link from "next/link"
import Image from "next/image"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel } from "@/models/blog"

async function getPublishedBlogs() {
  const connection = await connectProfileDB()
  const Blog = getBlogModel(connection)
  const blogs = await Blog.find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .select("title slug excerpt content coverImage author tags publishedAt createdAt")
    .lean()

  return blogs.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
  }))
}

export const revalidate = 300

function estimateReadTimeFromHtml(html: string) {
  const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const words = plainText.split(" ").filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

export default async function BlogListingPage() {
  const blogs = await getPublishedBlogs()
  const latestBlog = blogs[0]
  const remainingBlogs = blogs.slice(1)

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-20 h-20 rounded overflow-hidden bg-white flex items-center justify-center">
            <Image src="/logo1.webp" alt="IND2B" width={72} height={72} className="object-contain" priority />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">IND2B TechBlog</h1>
          </div>
        </section>

        <div className="mt-8 mb-8" />

        {blogs.length === 0 ? (
          <p className="text-gray-600">No published blogs yet.</p>
        ) : (
          <div className="space-y-16">
            {latestBlog && (
              <section>
                <article className="grid md:grid-cols-2 gap-6 items-center group transition-transform duration-300 hover:-translate-y-1">
                  <Link href={`/blog/${latestBlog.slug}`} className="block">
                    {latestBlog.coverImage ? (
                      <img
                        src={latestBlog.coverImage}
                        alt={latestBlog.title}
                        className="w-full h-72 object-cover rounded-md group-hover:opacity-95 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-72 bg-gray-100 rounded-md" />
                    )}
                  </Link>

                  <div>
                    <Link href={`/blog/${latestBlog.slug}`}>
                      <h2 className="text-4xl font-semibold leading-tight group-hover:underline line-clamp-2">
                        {latestBlog.title}
                      </h2>
                    </Link>
                    <p className="text-xl text-gray-700 mt-3 line-clamp-2">{latestBlog.excerpt}</p>
                    <p className="text-sm text-gray-500 mt-4">
                      {latestBlog.author} • {new Date(latestBlog.publishedAt || latestBlog.createdAt).toLocaleDateString()} •{" "}
                      {estimateReadTimeFromHtml(`${latestBlog.content || ""}`)} min read
                    </p>
                  </div>
                </article>
              </section>
            )}

            {remainingBlogs.length > 0 && (
              <section className="pt-10 border-t border-gray-200">
                <h2 className="text-3xl font-semibold tracking-tight text-gray-700 mb-6">Latest</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingBlogs.map((blog) => (
                    <article key={blog._id} className="group transition-transform duration-300 hover:-translate-y-1">
                      <Link href={`/blog/${blog.slug}`} className="block">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                          className="w-full h-56 object-cover rounded-md group-hover:opacity-95 transition-opacity"
                          />
                        ) : (
                        <div className="w-full h-56 bg-gray-100 rounded-md" />
                        )}
                      </Link>
                      <div className="pt-3">
                        <p className="text-xs text-gray-500">
                          {blog.author} • {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()} •{" "}
                          {estimateReadTimeFromHtml(`${blog.content || ""}`)} min read
                        </p>
                        <Link href={`/blog/${blog.slug}`}>
                          <h3 className="text-2xl font-semibold leading-tight mt-2 group-hover:underline line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">{blog.excerpt}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
