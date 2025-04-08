import { StatsCard } from "@/components/admin/reviews/stats-card"
import { ReviewsTable } from "@/components/admin/reviews/reviews-table"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

async function getProductStats() {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()

    // Get the products collection
    let Product
    try {
      // Try to get the existing model
      Product = connection.models.Product
    } catch (e) {
      // If model doesn't exist, create a new one with an empty schema
      // This is just to query the collection
      // Use mongoose.Schema instead of connection.Schema
      Product = connection.model("Product", new mongoose.Schema({}))
    }

    // Get total count
    const total = (await Product.countDocuments()) || 0

    // Get counts by status
    const pending = (await Product.countDocuments({ status: "Pending" })) || 0
    const approved = (await Product.countDocuments({ status: "Approved" })) || 0
    const flagged = (await Product.countDocuments({ status: "Flagged" })) || 0

    return {
      total,
      pending,
      approved,
      flagged,
    }
  } catch (error: unknown) {
    // Properly handle unknown error type
    console.error("Error fetching product stats:", error instanceof Error ? error.message : "Unknown error")

    return {
      total: 0,
      pending: 0,
      approved: 0,
      flagged: 0,
    }
  }
}

export default async function ReviewsPage() {
  const stats = await getProductStats()

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard title="Total Products" value={stats.total} type="total" />
        <StatsCard title="Pending Products" value={stats.pending} type="pending" />
        <StatsCard title="Approved Products" value={stats.approved} type="approved" />
        <StatsCard title="Flagged Products" value={stats.flagged} type="flagged" />
      </div>

      <ReviewsTable />
    </div>
  )
}

