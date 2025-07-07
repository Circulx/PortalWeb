"use server"

import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Review Schema
const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "hidden", "reported"], default: "active" },
  },
  { timestamps: true },
)

// Compound indexes for efficient queries
reviewSchema.index({ productId: 1, createdAt: -1 })
reviewSchema.index({ sellerId: 1, createdAt: -1 })
reviewSchema.index({ userId: 1, orderId: 1, productId: 1 }, { unique: true })

export async function submitReviews(orderId: string, reviews: any[], userEmail: string, userName: string) {
  try {
    if (!orderId || !reviews || !Array.isArray(reviews)) {
      throw new Error("Invalid request data")
    }

    // Validate reviews data
    for (const review of reviews) {
      if (!review.product_id || !review.seller_id || !review.rating || review.rating < 1 || review.rating > 5) {
        throw new Error("Invalid review data")
      }
    }

    const connection = await connectProfileDB()

    // Get or create Review model
    const Review = connection.models.Review || connection.model("Review", reviewSchema)

    // Check if user has already reviewed products from this order
    const existingReviews = await Review.find({
      userId: userEmail,
      orderId: orderId,
    })

    if (existingReviews.length > 0) {
      throw new Error("You have already reviewed products from this order")
    }

    // Create review documents
    const reviewDocuments = reviews.map((review) => ({
      userId: userEmail,
      orderId: orderId,
      productId: review.product_id,
      sellerId: review.seller_id,
      rating: review.rating,
      review: review.review || "",
      userName: userName,
      userEmail: userEmail,
      isVerifiedPurchase: true,
      status: "active",
    }))

    // Insert all reviews
    await Review.insertMany(reviewDocuments)

    return {
      success: true,
      message: "Reviews submitted successfully",
      reviewCount: reviewDocuments.length,
    }
  } catch (error) {
    console.error("Error submitting reviews:", error)
    throw error
  }
}

export async function getProductReviews(productId: string, page = 1, limit = 10) {
  try {
    const connection = await connectProfileDB()
    const Review = connection.models.Review || connection.model("Review", reviewSchema)

    const query = { productId, status: "active" }
    const skip = (page - 1) * limit

    const [reviews, totalCount] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ])

    // Calculate average rating and distribution
    const ratingStats = await Review.aggregate([
      { $match: { productId, status: "active" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ])

    let averageRating = null
    let ratingDistribution = null

    if (ratingStats.length > 0) {
      averageRating = Math.round(ratingStats[0].averageRating * 10) / 10

      // Calculate rating distribution
      const ratings = ratingStats[0].ratings
      ratingDistribution = {
        5: ratings.filter((r: number) => r === 5).length,
        4: ratings.filter((r: number) => r === 4).length,
        3: ratings.filter((r: number) => r === 3).length,
        2: ratings.filter((r: number) => r === 2).length,
        1: ratings.filter((r: number) => r === 1).length,
      }
    }

    return {
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      averageRating,
      ratingDistribution,
    }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    throw error
  }
}
