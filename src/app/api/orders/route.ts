import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(req: NextRequest) {
  try {
    // Get the current logged-in user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Connect to the PROFILEDB database
    const { db } = await connectProfileDB()

    // Check if db is defined
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the orders collection
    const ordersCollection = db.collection("orders")

    // Find all orders for the current user
    const orders = await ordersCollection.find({ userId: user.id }).toArray()

    // Transform the orders to handle MongoDB ObjectId serialization
    // and ensure product images are properly included
    const serializedOrders = orders.map((order) => {
      // Process products to ensure image URLs are properly formatted
      const products =
        order.products?.map((product: any) => {
          // Log product data to help debug
          console.log("Product data:", product)

          return {
            ...product,
            // Ensure image_link is properly formatted
            image_link: product.image_link  || "/placeholder.svg",
          }
        }) || []

      return {
        ...order,
        _id: order._id.toString(),
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
        products: products,
      }
    })

    return NextResponse.json(serializedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
