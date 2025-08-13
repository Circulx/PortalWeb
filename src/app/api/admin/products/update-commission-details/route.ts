import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function PUT(request: NextRequest) {
  try {
    console.log("Updating product commission details in PROFILE_DB...")
    const { productId, commission_type, commission_value, final_price } = await request.json()

    if (!productId || commission_type === undefined || commission_value === undefined || final_price === undefined) {
      return NextResponse.json(
        { error: "Product ID, commission type, commission value, and final price are required" },
        { status: 400 },
      )
    }

    // Validate commission type
    if (!["percentage", "fixed"].includes(commission_type)) {
      return NextResponse.json({ error: "Invalid commission type. Must be percentage or fixed" }, { status: 400 })
    }

    // Validate commission value
    if (commission_value < 0) {
      return NextResponse.json({ error: "Commission value cannot be negative" }, { status: 400 })
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
    console.log(
      `Attempting to update product with product_id: ${productIdNum} commission details: ${commission_type}, ${commission_value}, final_price: ${final_price}`,
    )

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
          commission_type: commission_type,
          commission_value: commission_value,
          final_price: final_price,
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
      console.log(`Product ${productId} was found but no changes were made (possibly same commission details)`)
    }

    const updatedProduct = await Product.findOne({ product_id: productIdNum }).lean()
    console.log(
      `Product ID ${productId} commission details successfully updated in PROFILE_DB - Type: ${commission_type}, Value: ${commission_value}, Final Price: ${final_price}`,
    )

    return NextResponse.json({
      success: true,
      message: `Product ID ${productId} commission details updated successfully`,
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Error updating product commission details in PROFILE_DB:", error)
    return NextResponse.json({ error: "Failed to update product commission details" }, { status: 500 })
  }
}
