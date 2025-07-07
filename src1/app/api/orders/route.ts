import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("Starting orders fetch...")

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      console.log("No authenticated user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Authenticated user:", {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
    })

    // Connect to database with retry logic
    let connection, db
    let retries = 3

    while (retries > 0) {
      try {
        const result = await connectProfileDB()
        connection = result.connection
        db = result.db
        console.log("Database connected successfully")
        break
      } catch (error) {
        retries--
        console.log(`Database connection attempt failed, retries left: ${retries}`)
        if (retries === 0) {
          throw error
        }
        // Wait 2 seconds before retry
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    if (!connection || !db) {
      throw new Error("Failed to establish database connection")
    }

    // Use the Order model instead of direct collection access
    const OrderModel = connection.models.Order
    if (!OrderModel) {
      throw new Error("Order model not found")
    }

    // Find orders for the current user using the model
    console.log("Searching for orders with userId:", user.id)
    const orders = await OrderModel.find({ userId: user.id }).sort({ createdAt: -1 }).limit(50).lean() // Use lean() for better performance and plain objects

    console.log(`Found ${orders.length} orders for user ${user.id}`)

    // Convert MongoDB documents to plain objects
    const serializedOrders = orders.map((order: any) => ({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
      // Ensure products array is properly formatted
      products:
        order.products?.map((product: any) => ({
          ...product,
          image_link: product.image_link || "/placeholder.svg?height=100&width=100",
          productId: product.productId || product.product_id,
        })) || [],
    }))

    console.log("Returning serialized orders:", serializedOrders.length)
    return NextResponse.json(serializedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch orders",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
