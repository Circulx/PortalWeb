import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose" // Use mongoose instead of mongodb

export async function GET(req: NextRequest, { params }: { params:any }) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const orderId = params.id

    // Connect to the database
    const connection = await connectProfileDB()
    const Order = connection.models.Order

    if (!Order) {
      return NextResponse.json({ error: "Order model not found" }, { status: 500 })
    }

    // Find the specific order
    let order
    try {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findOne({ _id: new mongoose.Types.ObjectId(orderId) })
      } else {
        return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
      }
    } catch (error) {
      console.error("Error finding order:", error)
      return NextResponse.json({ error: "Error finding order" }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if the user is an admin or the order belongs to the user
    // Use user.type instead of user.role
    if (user.type !== "admin" && order.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 })
    }

    // Transform the order to handle MongoDB ObjectId serialization
    const serializedOrder = {
      ...order.toObject(),
      _id: order._id.toString(),
      userId: order.userId.toString(),
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
      products:
        order.products?.map((product: any) => ({
          ...product,
          productId: product.productId ? product.productId.toString() : undefined,
          product_id: product.product_id ? product.product_id.toString() : undefined,
        })) || [],
    }

    return NextResponse.json(serializedOrder)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// Fix the PATCH method as well
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Check if user is an admin or seller - use type instead of role
    if (user.type !== "admin" && user.type !== "seller") {
      return NextResponse.json({ error: "Unauthorized. Admin or seller access required" }, { status: 403 })
    }

    // Parse request body
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Connect to the database
    const connection = await connectProfileDB()
    const Order = connection.models.Order

    if (!Order) {
      return NextResponse.json({ error: "Order model not found" }, { status: 500 })
    }

    // Get the order ID from the URL
    const orderId = params.id

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
    }

    // If user is a seller, ensure they can only update their own orders
    let query: any = { _id: new mongoose.Types.ObjectId(orderId) }

    if (user.type === "seller") {
      // For sellers, add a condition to check if the order contains their products
      query = {
        _id: new mongoose.Types.ObjectId(orderId),
        "products.sellerId": user.id,
      }
    }

    // Update the order status
    const result = await Order.updateOne(query, {
      $set: {
        status: status,
        updatedAt: new Date(),
      },
    })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found or you don't have permission to update it" }, { status: 404 })
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
