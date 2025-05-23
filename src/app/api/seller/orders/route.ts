import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log(`Fetching orders for seller: ${user.id}`)

    // Connect to the profile database
    const connection = await connectProfileDB()

    if (!connection) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the orders collection
    const Order = connection.models.Order || connection.model("Order", new mongoose.Schema({}, { strict: false }))

    // Get all orders - for now, we're showing all orders without filtering by seller
    const allOrders = await Order.find({}).sort({ createdAt: -1 }).lean()
    console.log(`Found ${allOrders.length} total orders in the database`)

    // Process orders to ensure consistent format
    const processedOrders = allOrders.map((order: any) => {
      return {
        _id: order._id?.toString() || "",
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
        status: order.status || "pending",
        products: order.products || [],
        billingDetails: order.billingDetails || {},
        totalAmount: order.totalAmount || 0,
        // Calculate a subtotal based on all products
        sellerSubtotal: (order.products || []).reduce((sum: number, product: any) => {
          const price = typeof product.price === "number" ? product.price : 0
          const quantity = typeof product.quantity === "number" ? product.quantity : 0
          return sum + price * quantity
        }, 0),
        paymentMethod: order.paymentMethod || "Not specified",
        paymentStatus: order.paymentStatus || "pending",
      }
    })

    // Log the number of orders being returned
    console.log(`Returning ${processedOrders.length} orders to the seller`)

    return NextResponse.json({ orders: processedOrders })
  } catch (error) {
    console.error("Error fetching seller orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
