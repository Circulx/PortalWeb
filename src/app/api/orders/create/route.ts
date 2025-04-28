import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 })
    }

    // Parse the request body
    const orderData = await request.json()

    // Connect to the database
    const conn = await connectProfileDB()
    const OrderModel = conn.models.Order

    // Ensure status is uppercase to match enum
    const orderToSave = {
      ...orderData,
      userId: user.id,
      status: orderData.status ? orderData.status.toUpperCase() : "PENDING",
      createdAt: new Date(),
    }

    // Create the order using the Order model
    const newOrder = new OrderModel(orderToSave)

    // Save the order
    await newOrder.save()

    console.log("Order created successfully with ID:", newOrder._id)

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 },
    )
  }
}
