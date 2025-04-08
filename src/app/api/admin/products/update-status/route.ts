import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating product status...")
    const { productId, status } = await request.json()

    if (!productId || !status) {
      return NextResponse.json({ error: "Product ID and status are required" }, { status: 400 })
    }

    // Validate status
    if (!["Pending", "Approved", "Flagged"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be Pending, Approved, or Flagged" }, { status: 400 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    console.log("Connected to profile database")

    // Get the products collection directly
    const db = connection.db
    const productsCollection = db.collection("products")

    // Update the product using the native MongoDB driver
    // This ensures the field is added if it doesn't exist
    const result = await productsCollection.updateOne(
      { product_id: Number.parseInt(productId.toString()) },
      {
        $set: {
          status: status,
          updated_at: new Date(),
        },
      },
    )

    console.log("Update result:", result)

    if (result.matchedCount === 0) {
      console.error(`Product with ID ${productId} not found`)
      return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 })
    }

    // Fetch the updated product to return in the response
    const updatedProduct = await productsCollection.findOne({ product_id: Number.parseInt(productId.toString()) })

    console.log(`Product ID ${productId} status updated to ${status}`)

    return NextResponse.json({
      success: true,
      message: `Product ID ${productId} status updated to ${status}`,
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Error updating product status:", error)
    return NextResponse.json({ error: "Failed to update product status" }, { status: 500 })
  }
}
