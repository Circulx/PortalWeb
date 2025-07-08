import { CustomerReviewsTable } from "@/components/admin/customer-reviews/customer-reviews-table"
import { CustomerReviewsStats } from "@/components/admin/customer-reviews/customer-reviews-stats"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

async function getReviewsStats() {
  try {
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

    const total = await Review.countDocuments()
    const pending = await Review.countDocuments({ status: "pending" })
    const approved = await Review.countDocuments({ status: "approved" })
    const rejected = await Review.countDocuments({ status: "rejected" })

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }])
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    return {
      total,
      pending,
      approved,
      rejected,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
    }
  } catch (error) {
    console.error("Error fetching reviews stats:", error)
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      avgRating: 0,
      ratingDistribution: [],
    }
  }
}

export default async function CustomerReviewsPage() {
  const stats = await getReviewsStats()

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-600">Manage and moderate customer reviews</p>
        </div>
      </div>

      <CustomerReviewsStats stats={stats} />
      <CustomerReviewsTable />
    </div>
  )
}
