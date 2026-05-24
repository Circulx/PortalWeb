import mongoose, { type Connection, type Model, type Schema } from "mongoose"

export type BlogStatus = "draft" | "published"

export interface IBlog {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  author: string
  tags: string[]
  status: BlogStatus
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 220 },
    excerpt: { type: String, required: true, trim: true, maxlength: 320 },
    content: { type: String, required: true, trim: true },
    coverImage: { type: String, trim: true, default: "" },
    author: { type: String, required: true, trim: true, maxlength: 80 },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    collection: "blogs",
  },
)

// slug index is already created via unique: true on the field definition
blogSchema.index({ status: 1, publishedAt: -1 })
blogSchema.index({ createdAt: -1 })

export function getBlogModel(connection: Connection): Model<IBlog> {
  return (connection.models.Blog as Model<IBlog>) || connection.model<IBlog>("Blog", blogSchema as Schema<IBlog>)
}
