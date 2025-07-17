import { Schema, type Document, type Connection } from "mongoose"

export interface IReview extends Document {
  userId: string
  orderId: string
  product_id: string
  title: string
  rating: number
  review: string
  status: "pending" | "approved" | "rejected"
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    product_id: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "reviews",
  },
)

// Compound indexes for efficient queries
reviewSchema.index({ userId: 1, orderId: 1, product_id: 1 }, { unique: true })
reviewSchema.index({ product_id: 1, status: 1 })
reviewSchema.index({ userId: 1, status: 1 })
reviewSchema.index({ orderId: 1, status: 1 })
reviewSchema.index({ createdAt: -1 })

const getReviewModel = (connection: Connection) => {
  // Delete existing model to force recreation with new schema
  if (connection.models.Review) {
    delete connection.models.Review
  }

  return connection.model<IReview>("Review", reviewSchema)
}

export default getReviewModel
