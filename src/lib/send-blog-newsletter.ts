import { connectProfileDB, NewsletterSchema } from "@/lib/profileDb"
import { sendEmail } from "@/lib/email"
import { generateBlogNewsletterEmail } from "@/lib/email-templates"

interface BlogData {
  title: string
  excerpt: string
  slug: string
  author: string
  coverImage?: string
  tags?: string[]
  publishedAt?: Date | null
}

export async function sendBlogNewsletter(blog: BlogData): Promise<void> {
  try {
    console.log(`[BlogNewsletter] ── START ── blog: "${blog.title}"`)

    // ── 1. Get DB connection ──────────────────────────────────────────────────
    const connection = await connectProfileDB()
    console.log(`[BlogNewsletter] DB connected. Models: ${Object.keys(connection.models).join(", ")}`)

    // ── 2. Safely resolve Newsletter model ────────────────────────────────────
    let Newsletter: ReturnType<typeof connection.model>
    try {
      Newsletter = connection.model("Newsletter")
    } catch {
      // Model not yet registered on this connection – register it now
      Newsletter = connection.model("Newsletter", NewsletterSchema)
    }
    console.log(`[BlogNewsletter] Newsletter model resolved`)

    // ── 3. Fetch subscribers directly from collection (bypass model quirks) ──
    const db = connection.db
    if (!db) {
      console.error("[BlogNewsletter] DB instance is undefined – aborting")
      return
    }

    const rawSubscribers = await db
      .collection("newsletter")
      .find({ isActive: true }, { projection: { email: 1, _id: 0 } })
      .toArray()

    console.log(`[BlogNewsletter] Raw subscriber count: ${rawSubscribers.length}`)

    if (!rawSubscribers.length) {
      console.log("[BlogNewsletter] No active subscribers – done")
      return
    }

    const emails = rawSubscribers
      .map((s) => s.email as string)
      .filter(Boolean)

    console.log(`[BlogNewsletter] Sending to ${emails.length} subscribers`)

    // ── 4. Send emails in batches of 10 ──────────────────────────────────────
    const BATCH_SIZE = 10
    let sent = 0
    let failed = 0

    const html = (email: string) =>
      generateBlogNewsletterEmail({
        blogTitle: blog.title,
        blogExcerpt: blog.excerpt,
        blogSlug: blog.slug,
        blogAuthor: blog.author,
        blogCoverImage: blog.coverImage,
        blogTags: blog.tags ?? [],
        publishedAt: blog.publishedAt,
        subscriberEmail: email,
      })

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE)

      const results = await Promise.allSettled(
        batch.map((email) =>
          sendEmail({
            to: email,
            subject: `📰 New Post on IND2B: ${blog.title}`,
            html: html(email),
          })
        )
      )

      results.forEach((result, idx) => {
        const email = batch[idx]
        if (result.status === "fulfilled") {
          if (result.value?.success === false) {
            failed++
            console.error(`[BlogNewsletter] ✗ sendEmail returned failure for ${email}: ${result.value.error}`)
          } else {
            sent++
            console.log(`[BlogNewsletter] ✓ Sent to ${email}`)
          }
        } else {
          failed++
          console.error(`[BlogNewsletter] ✗ Promise rejected for ${email}:`, result.reason)
        }
      })

      if (i + BATCH_SIZE < emails.length) {
        await new Promise((res) => setTimeout(res, 300))
      }
    }

    console.log(`[BlogNewsletter] ── DONE ── Sent: ${sent} | Failed: ${failed}`)
  } catch (err) {
    console.error("[BlogNewsletter] ── FATAL ERROR ──", err)
  }
}