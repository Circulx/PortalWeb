import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"
import { sendEmail } from "@/lib/email"
import { generateOrderConfirmationEmail } from "@/lib/email-templates"
import type { Order } from "@/models/profile/order"

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

    // Send confirmation email if email is available
    if (orderData.billingDetails?.email) {
      try {
        const orderObj = newOrder.toObject() as Order
        const htmlContent = generateOrderConfirmationEmail(orderObj)

        await sendEmail({
          to: orderData.billingDetails.email,
          subject: `Order Confirmation #${newOrder._id}`,
          html: htmlContent,
        })

        console.log("Order confirmation email sent successfully")
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError)
        // Don't fail the order creation if email sending fails
      }
    }

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
