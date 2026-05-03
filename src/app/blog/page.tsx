import Link from "next/link"
import Image from "next/image"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel } from "@/models/blog"

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function getPublishedBlogs(filterTag?: string | null) {
  const connection = await connectProfileDB()
  const Blog = getBlogModel(connection)
  const query: Record<string, unknown> = { status: "published" }
  if (filterTag?.trim()) {
    query.tags = { $regex: new RegExp(`^${escapeRegex(filterTag.trim())}$`, "i") }
  }

  const blogs = await Blog.find(query)
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

/** Grid shows 2 columns × 2 rows = 4 cards per page */
const BLOGS_PER_PAGE = 4

function buildBlogListUrl(page: number, tag?: string | null) {
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  if (tag?.trim()) params.set("tag", tag.trim())
  const q = params.toString()
  return q ? `/blog?${q}` : "/blog"
}

function PaginationLink({
  page,
  disabled,
  label,
  tag,
}: {
  page: number
  disabled: boolean
  label: string
  tag?: string | null
}) {
  if (disabled) {
    return (
      <span className="px-4 py-2 text-sm rounded-md border border-gray-200 text-gray-400 cursor-not-allowed select-none">
        {label}
      </span>
    )
  }
  const href = buildBlogListUrl(page, tag)
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {label}
    </Link>
  )
}

type BlogListingPageProps = {
  searchParams: Promise<{ page?: string; tag?: string }>
}

export default async function BlogListingPage({ searchParams }: BlogListingPageProps) {
  const sp = await searchParams
  const activeTag = sp.tag?.trim() || null
  const parsed = parseInt(sp.page ?? "1", 10)
  const requestedPage = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1

  const blogs = await getPublishedBlogs(activeTag)
  const latestBlog = blogs[0]
  const remainingBlogs = blogs.slice(1)

  const totalRemaining = remainingBlogs.length
  const totalPages = Math.max(1, Math.ceil(totalRemaining / BLOGS_PER_PAGE))
  const currentPage = Math.min(requestedPage, totalPages)
  const start = (currentPage - 1) * BLOGS_PER_PAGE
  const paginatedBlogs = remainingBlogs.slice(start, start + BLOGS_PER_PAGE)

  const showingFrom = totalRemaining === 0 ? 0 : start + 1
  const showingTo = Math.min(start + BLOGS_PER_PAGE, totalRemaining)

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="max-w-6xl mx-auto px-2 py-6 sm:px-4">
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
          <p className="text-gray-600">
            {activeTag ? `No posts tagged “${activeTag}”.` : "No published blogs yet."}{" "}
            {activeTag && (
              <Link href="/blog" className="font-medium text-blue-600 hover:underline">
                View all posts
              </Link>
            )}
          </p>
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
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
                  <h2 className="text-3xl font-semibold tracking-tight text-gray-700">Latest</h2>
                  {totalRemaining > BLOGS_PER_PAGE && (
                    <p className="text-sm text-gray-500">
                      Showing {showingFrom}–{showingTo} of {totalRemaining}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  {paginatedBlogs.map((blog) => (
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

                {totalPages > 1 && (
                  <nav
                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                    aria-label="Blog list pagination"
                  >
                    <PaginationLink
                      page={currentPage - 1}
                      disabled={currentPage <= 1}
                      label="Previous"
                      tag={activeTag}
                    />
                    <span className="px-3 py-2 text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <PaginationLink
                      page={currentPage + 1}
                      disabled={currentPage >= totalPages}
                      label="Next"
                      tag={activeTag}
                    />
                  </nav>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
