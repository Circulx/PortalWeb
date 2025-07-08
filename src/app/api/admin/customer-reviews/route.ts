import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define Review schema
const reviewSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  orderItems: [
    {
      id: String,
      name: String,
      image_link: String,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Add indexes for efficient querying
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ rating: 1 })
reviewSchema.index({ status: 1, createdAt: -1 })

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const rating = searchParams.get("rating")

    console.log("Connecting to profile database...")
    const connection = await connectProfileDB()
    console.log("Connected successfully")

    // Get or create Review model
    let Review
    try {
      Review = connection.models.Review
      console.log("Using existing Review model")
    } catch (error) {
      console.log("Creating new Review model")
      Review = connection.model("Review", reviewSchema)
    }

    console.log("Review model:", Review)

    // Build filter query
    const filter: any = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (rating && rating !== "all") {
      filter.rating = Number.parseInt(rating)
    }

    console.log("Filter:", filter)

    // Get total count for pagination
    console.log("Getting total count...")
    const total = await Review.countDocuments(filter)
    console.log("Total reviews:", total)

    // Get reviews with pagination
    console.log("Fetching reviews...")
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    console.log("Found reviews:", reviews.length)

    // Get statistics
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
    ])

    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const statistics = stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    }

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statistics,
      ratingDistribution,
    })
  } catch (error) {
    console.error("Error fetching customer reviews:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch customer reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
