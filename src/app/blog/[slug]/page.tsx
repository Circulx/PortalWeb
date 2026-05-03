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

async function getRelatedBlogs(currentBlog: any) {
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
          .limit(4)
          .select("title slug coverImage author excerpt publishedAt createdAt")
          .lean()
      : []

  if (relatedByTags.length >= 4) {
    return relatedByTags.map((item) => ({ ...item, _id: item._id.toString() }))
  }

  const existingSlugs = new Set([currentBlog.slug, ...relatedByTags.map((item) => item.slug)])
  const fallback = await Blog.find({
    status: "published",
    slug: { $nin: Array.from(existingSlugs) },
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(4 - relatedByTags.length)
    .select("title slug coverImage author excerpt publishedAt createdAt")
    .lean()

  return [...relatedByTags, ...fallback].map((item) => ({ ...item, _id: item._id.toString() }))
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

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  const relatedBlogs = await getRelatedBlogs(blog)

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
    <main className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} className="w-full max-h-[420px] object-cover rounded-lg mb-6" />
        )}

        <p className="text-sm text-gray-500 mb-2">
          {blog.author} • {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
        </p>
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        <p className="text-lg text-gray-700 mb-6">{blog.excerpt}</p>

        <div
          className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:my-6"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      {relatedBlogs.length > 0 && (
        <section className="max-w-5xl mx-auto mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-3xl font-bold mb-8">More from our blog</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {relatedBlogs.map((item) => (
              <Link key={item._id} href={`/blog/${item.slug}`} className="group block">
                <div className="overflow-hidden rounded-xl border bg-white">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-56 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gray-100" />
                  )}
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {item.author} • {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                  </p>
                  <h3 className="text-2xl font-semibold leading-tight group-hover:underline">{item.title}</h3>
                  {item.excerpt && <p className="mt-2 text-gray-600 line-clamp-2">{item.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
