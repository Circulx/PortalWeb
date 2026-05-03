import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { connectProfileDB } from "@/lib/profileDb"
import { getBlogModel } from "@/models/blog"
import sanitizeHtml from "sanitize-html"

async function getBlogBySlug(slug: string) {
  const connection = await connectProfileDB()
  const Blog = getBlogModel(connection)
  const blog = await Blog.findOne({ slug, status: "published" }).lean()
  if (!blog) return null
  return {
    ...blog,
    _id: blog._id.toString(),
  }
}

/** All related posts: tag matches first, then other published posts (newest first). */
async function getAllRelatedBlogsOrdered(currentBlog: { slug: string; tags?: string[] }) {
  const connection = await connectProfileDB()
  const Blog = getBlogModel(connection)
  const tags = Array.isArray(currentBlog.tags) ? currentBlog.tags.filter(Boolean) : []

  const relatedByTags =
    tags.length > 0
      ? await Blog.find({
          status: "published",
          slug: { $ne: currentBlog.slug },
          tags: { $in: tags },
        })
          .sort({ publishedAt: -1, createdAt: -1 })
          .select("title slug coverImage author excerpt publishedAt createdAt")
          .lean()
      : []

  const usedSlugs = new Set<string>([currentBlog.slug, ...relatedByTags.map((item) => item.slug)])

  const fallback = await Blog.find({
    status: "published",
    slug: { $nin: Array.from(usedSlugs) },
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .select("title slug coverImage author excerpt publishedAt createdAt")
    .lean()

  return [...relatedByTags, ...fallback].map((item) => ({
    ...item,
    _id: item._id.toString(),
  }))
}

/** 3 columns × 2 rows */
const RELATED_PER_PAGE = 6

function buildRelatedPageUrl(slug: string, page: number) {
  if (page <= 1) return `/blog/${slug}`
  return `/blog/${slug}?rpage=${page}`
}

function RelatedPaginationLink({
  slug,
  page,
  disabled,
  label,
}: {
  slug: string
  page: number
  disabled: boolean
  label: string
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 cursor-not-allowed select-none">
        {label}
      </span>
    )
  }
  return (
    <Link
      href={buildRelatedPageUrl(slug, page)}
      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
    >
      {label}
    </Link>
  )
}

function formatBlogDate(d: string | Date | undefined) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) {
    return { title: "Blog not found" }
  }

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  }
}

function TealHeroImage({
  src,
  alt,
}: {
  src: string
  alt: string
}) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-xl bg-gray-100/80 shadow-sm ring-1 ring-gray-300/40">
      <div className="absolute left-0 top-0 z-10 h-12 w-16 rounded-br-xl bg-teal-500 shadow-sm" aria-hidden />
      <img src={src} alt={alt} className="max-h-[420px] w-full object-cover" />
    </div>
  )
}

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ rpage?: string }>
}

export default async function BlogDetailPage({ params, searchParams }: BlogDetailPageProps) {
  const { slug } = await params
  const sp = await searchParams
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  const parsedRelated = parseInt(sp.rpage ?? "1", 10)
  const requestedRelatedPage =
    Number.isFinite(parsedRelated) && parsedRelated >= 1 ? Math.floor(parsedRelated) : 1

  const allRelated = await getAllRelatedBlogsOrdered(blog)
  const totalRelated = allRelated.length
  const totalRelatedPages = Math.max(1, Math.ceil(totalRelated / RELATED_PER_PAGE))
  const relatedPage = Math.min(requestedRelatedPage, totalRelatedPages)
  const relatedStart = (relatedPage - 1) * RELATED_PER_PAGE
  const relatedBlogs = allRelated.slice(relatedStart, relatedStart + RELATED_PER_PAGE)
  const relatedShowingFrom = totalRelated === 0 ? 0 : relatedStart + 1
  const relatedShowingTo = Math.min(relatedStart + RELATED_PER_PAGE, totalRelated)

  const primaryTag = Array.isArray(blog.tags) && blog.tags.length > 0 ? blog.tags[0] : null

  const safeHtml = sanitizeHtml(blog.content || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "u", "s"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height", "loading"],
      a: ["href", "name", "target", "rel"],
      "*": ["style", "class"],
    },
    allowedSchemes: ["http", "https", "data", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowedStyles: {
      "*": {
        color: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
        "background-color": [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
      },
      img: {
        width: [/^\d+(\.\d+)?(px|%)$/],
        height: [/^\d+(\.\d+)?(px|%)$/, /^auto$/],
        "max-width": [/^\d+(\.\d+)?(px|%)$/, /^100%$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  })

  return (
    <div className="min-h-screen w-full bg-gray-100 pb-16 pt-6 sm:pb-20 sm:pt-10">
      <article className="mx-auto max-w-3xl px-2 sm:px-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
          {blog.title}
        </h1>

        <p className="mt-4 text-sm text-gray-500 sm:text-base">
          <span className="font-medium text-gray-700">By {blog.author}</span>
          <span className="mx-2 text-gray-300">·</span>
          {formatBlogDate(blog.publishedAt || blog.createdAt)}
          {primaryTag && (
            <>
              <span className="mx-2 text-gray-300">·</span>
              <Link
                href={`/blog?tag=${encodeURIComponent(primaryTag)}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {primaryTag}
              </Link>
            </>
          )}
        </p>

        <p className="mt-6 text-lg leading-relaxed text-gray-600">{blog.excerpt}</p>

        {blog.coverImage ? (
          <TealHeroImage src={blog.coverImage} alt={blog.title} />
        ) : (
          <div className="mb-10 h-px w-full bg-transparent" aria-hidden />
        )}

        <div
          className="prose prose-lg max-w-none text-gray-800 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-lg prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      {totalRelated > 0 && (
        <section className="mx-auto mt-16 max-w-6xl border-t border-gray-300/60 px-2 pt-12 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">More from our blog</h2>
            {totalRelated > RELATED_PER_PAGE && (
              <p className="text-sm text-gray-500">
                Showing {relatedShowingFrom}–{relatedShowingTo} of {totalRelated}
              </p>
            )}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {relatedBlogs.map((item) => (
              <Link key={item._id} href={`/blog/${item.slug}`} className="group block">
                <div className="overflow-hidden rounded-xl ring-1 ring-gray-300/50">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-48"
                    />
                  ) : (
                    <div className="h-44 bg-gray-200/60 sm:h-48" />
                  )}
                </div>
                <div className="pt-3">
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {item.author} · {formatBlogDate(item.publishedAt || item.createdAt)}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug text-gray-900 group-hover:text-blue-700 group-hover:underline line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{item.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalRelatedPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
              aria-label="More articles pagination"
            >
              <RelatedPaginationLink
                slug={slug}
                page={relatedPage - 1}
                disabled={relatedPage <= 1}
                label="Previous"
              />
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{relatedPage}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalRelatedPages}</span>
              </span>
              <RelatedPaginationLink
                slug={slug}
                page={relatedPage + 1}
                disabled={relatedPage >= totalRelatedPages}
                label="Next"
              />
            </nav>
          )}
        </section>
      )}
    </div>
  )
}
