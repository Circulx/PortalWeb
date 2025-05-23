import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET() {
  try {
    console.log("Fetching products from PROFILE_DB")
    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()

    // Get the Product model from the connection
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Log available collections to debug
    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray()
        console.log(
          "Available collections in main connection:",
          collections.map((c) => c.name),
        )
      } catch (err) {
        console.error("Error listing collections:", err)
      }
    }

    // Only fetch products that are active and not drafts
    const products = await ProductModel.find({
      isActive: true, // Only return active products
      is_draft: false, // Don't return draft products
    }).lean()

    console.log(`Found ${products.length} active products in PROFILE_DB`)

    if (products.length > 0) {
      return NextResponse.json(products, { status: 200 })
    }

    // If no products found, return empty array
    console.log("No active products found in PROFILE_DB, returning empty array")
    return NextResponse.json([], { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching products from PROFILE_DB:", errorMessage)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()

    // Get the Product model from the connection
    const ProductModel = connection.models.Product

    const productData = await request.json()
    const newProduct = new ProductModel(productData)
    await newProduct.save()
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error posting product:", errorMessage)
    return NextResponse.json({ error: "Error posting product" }, { status: 500 })
  }
}
