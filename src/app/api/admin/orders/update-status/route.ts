import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import { ObjectId } from "mongodb"

export async function PATCH(req: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Check if user is an admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required" }, { status: 403 })
    }

    // Parse request body
    const { orderId, status } = await req.json()

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Connect to the database
    const { db } = await connectProfileDB()

    // Check if db is defined
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the orders collection
    const ordersCollection = db.collection("orders")

    // Update the order status
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}
