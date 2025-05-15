import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Order = connection.models.Order

    let order

    // Try to find by MongoDB ObjectId first
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findOne({ _id: new mongoose.Types.ObjectId(id) })
      }
    } catch (error) {
      console.error("Error finding order by ObjectId:", error)
    }

    // If not found by ObjectId, try to find by orderId string
    if (!order) {
      order = await Order.findOne({ orderId: id })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
