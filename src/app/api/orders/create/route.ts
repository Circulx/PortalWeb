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

    // Debug: Log the incoming products structure
    console.log("Incoming products:", JSON.stringify(orderData.products, null, 2))

    // Ensure products have the correct field names with more robust transformation
    const transformedProducts = orderData.products.map((product: any) => {
      // Debug: Log each product before transformation
      console.log("Processing product:", JSON.stringify(product, null, 2))

      // Generate a fallback ID if none exists
      const fallbackId = `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Extract the product ID from various possible sources with fallback
      const productId = product.productId || product.id || (product._id ? product._id.toString() : fallbackId)

      // Debug: Log the extracted productId
      console.log("Extracted productId:", productId)

      return {
        productId: productId,
        title: product.title || "Unknown Product",
        quantity: Number(product.quantity) || 1,
        price: Number(product.price) || 0,
        image_link: product.image_link || product.image || null,
      }
    })

    // Debug: Log the transformed products
    console.log("Transformed products:", JSON.stringify(transformedProducts, null, 2))

    // Ensure status is uppercase to match enum
    const orderToSave = {
      ...orderData,
      userId: user.id,
      products: transformedProducts, // Use the transformed products
      status: orderData.status ? orderData.status.toUpperCase() : "PENDING",
      createdAt: new Date(),
    }

    // Debug: Log the final order data being saved
    console.log(
      "Order data to save:",
      JSON.stringify(
        {
          ...orderToSave,
          products: orderToSave.products.map((p: { productId: any; title: any; quantity: any; price: any }) => ({
            productId: p.productId,
            title: p.title,
            quantity: p.quantity,
            price: p.price,
          })),
        },
        null,
        2,
      ),
    )

    // Connect to the database
    const conn = await connectProfileDB()
    const OrderModel = conn.models.Order

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
