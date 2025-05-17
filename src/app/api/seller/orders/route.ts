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

    // Get all orders
    const allOrders = await Order.find({}).lean()
    console.log(`Found ${allOrders.length} total orders in the database`)

    // Get the products collection
    const Product = connection.models.Product || connection.model("Product", new mongoose.Schema({}, { strict: false }))

    // Find all products belonging to this seller
    const sellerProducts = await Product.find({
      $or: [{ seller_id: user.id }, { sellerId: user.id }],
    }).lean()

    console.log(`Found ${sellerProducts.length} products for seller ${user.id}`)

    if (sellerProducts.length === 0) {
      return NextResponse.json({ orders: [] }, { status: 200 })
    }

    // Create a set of seller product IDs for quick lookup
    const sellerProductIds = new Set(sellerProducts.map((product: any) => product._id?.toString()).filter(Boolean))

    // Log seller product IDs
    console.log(`Seller product IDs: ${Array.from(sellerProductIds).join(", ")}`)

    // DIRECT APPROACH: Just return all orders for now to see what's available
    // This will help us understand the data better
    const processedOrders = allOrders.map((order: any) => {
      return {
        ...order,
        _id: order._id?.toString() || "",
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
        status: order.status || "pending",
        // Include all products for now
        products: order.products || [],
        // Calculate a subtotal based on all products
        sellerSubtotal: (order.products || []).reduce((sum: number, product: any) => {
          const price = typeof product.price === "number" ? product.price : 0
          const quantity = typeof product.quantity === "number" ? product.quantity : 0
          return sum + price * quantity
        }, 0),
        originalTotal: order.totalAmount || 0,
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
