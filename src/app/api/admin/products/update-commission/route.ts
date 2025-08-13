import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating product commission in PROFILE_DB...")
    const { productId, commission } = await request.json()

    if (!productId || !commission) {
      return NextResponse.json({ error: "Product ID and commission are required" }, { status: 400 })
    }

    // Validate commission
    if (!["Yes", "No"].includes(commission)) {
      return NextResponse.json({ error: "Invalid commission. Must be Yes or No" }, { status: 400 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    console.log("Connected to PROFILE_DB")

    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in profileDb connection")
      return NextResponse.json({ error: "Product model not available" }, { status: 500 })
    }

    const productIdNum = Number.parseInt(productId.toString())
    console.log(`Attempting to update product with product_id: ${productIdNum} to commission: ${commission}`)

    // First check if the product exists
    const existingProduct = await Product.findOne({ product_id: productIdNum }).lean()
    console.log("Existing product found:", existingProduct ? "Yes" : "No")

    if (!existingProduct) {
      console.error(`Product with product_id ${productIdNum} not found in PROFILE_DB`)
      return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 })
    }

    const result = await Product.updateOne(
      { product_id: productIdNum },
      {
        $set: {
          commission: commission,
          updated_at: new Date(),
        },
      },
    )

    console.log("Update result:", {
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })

    if (!result.acknowledged) {
      console.error("Update operation was not acknowledged by MongoDB")
      return NextResponse.json({ error: "Database update failed - operation not acknowledged" }, { status: 500 })
    }

    if (result.matchedCount === 0) {
      console.error(`Product with ID ${productId} not found during update`)
      return NextResponse.json({ error: `Product with ID ${productId} not found` }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      console.log(`Product ${productId} was found but no changes were made (possibly same commission)`)
    }

    const updatedProduct = await Product.findOne({ product_id: productIdNum }).lean()
    console.log(`Product ID ${productId} commission successfully updated to ${commission} in PROFILE_DB`)

    return NextResponse.json({
      success: true,
      message: `Product ID ${productId} commission updated to ${commission}`,
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Error updating product commission in PROFILE_DB:", error)
    return NextResponse.json({ error: "Failed to update product commission" }, { status: 500 })
  }
}
