import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function PUT(request: NextRequest) {
  try {
    const { reviewId, status } = await request.json()

    if (!reviewId || !status) {
      return NextResponse.json({ error: "Review ID and status are required" }, { status: 400 })
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const connection = await connectProfileDB()

    let Review
    try {
      Review = connection.models.Review
    } catch (e) {
      const reviewSchema = new mongoose.Schema({
        orderId: { type: String, required: true },
        userId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, required: true },
        orderItems: [
          {
            id: String,
            name: String,
            image_link: String,
          },
        ],
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      })
      Review = connection.model("Review", reviewSchema)
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Review status updated successfully",
      review: updatedReview,
    })
  } catch (error) {
    console.error("Error updating review status:", error)
    return NextResponse.json({ error: "Failed to update review status" }, { status: 500 })
  }
}
