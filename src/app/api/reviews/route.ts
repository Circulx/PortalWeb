import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Review schema
const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, minlength: 10, maxlength: 500 },
    orderItems: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        image_link: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  },
)

// Compound index to prevent duplicate reviews for the same order by the same user
reviewSchema.index({ userId: 1, orderId: 1 }, { unique: true })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ rating: 1 })
reviewSchema.index({ status: 1, createdAt: -1 })

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { orderId, userId, rating, review, orderItems } = await request.json()

    // Validate required fields
    if (!orderId || !userId || !rating || !review || !orderItems) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Validate review length
    if (typeof review !== "string" || review.trim().length < 10 || review.trim().length > 500) {
      return NextResponse.json({ error: "Review must be between 10 and 500 characters" }, { status: 400 })
    }

    // Connect to the database
    const connection = await connectProfileDB()

    // Get or create the Review model
    const Review = connection.models.Review || connection.model("Review", reviewSchema)

    // Check if user has already reviewed this order
    const existingReview = await Review.findOne({
      userId: userId,
      orderId: orderId,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this order" }, { status: 409 })
    }

    // Create the review
    const newReview = new Review({
      userId: userId,
      orderId: orderId,
      rating: rating,
      review: review.trim(),
      orderItems: orderItems,
      status: "pending", // Reviews can be moderated before being public
    })

    await newReview.save()

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        reviewId: newReview._id.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting review:", error)

    // Handle duplicate key error (in case the unique index catches it)
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "You have already reviewed this order" }, { status: 409 })
    }

    return NextResponse.json(
      { error: "Failed to submit review", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Connect to the database
    const connection = await connectProfileDB()
    const Review = connection.models.Review || connection.model("Review", reviewSchema)

    const query: any = { status: "approved" } // Only show approved reviews by default

    if (orderId) {
      query.orderId = orderId
    }

    if (userId) {
      query.userId = userId
      delete query.status // Show all reviews for the user, regardless of status
    }

    const skip = (page - 1) * limit

    const reviews = await Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Review.countDocuments(query)

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        ...review,
        _id: review._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
