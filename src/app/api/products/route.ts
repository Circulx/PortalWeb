import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function GET(request: Request) {
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

    // Parse query parameters for filtering and limiting results
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "0", 10)

    // Build filter: only fetch products that are active and not drafts
    let filter: any = { isActive: true, is_draft: false }
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category_name: { $regex: query, $options: "i" } },
        { sub_category_name: { $regex: query, $options: "i" } },
      ]
    }

    // Query the database
    let productsQuery = ProductModel.find(filter).lean()
    if (limit > 0) productsQuery = productsQuery.limit(limit)

    const products = await productsQuery

    console.log(`Found ${products.length} active products in PROFILE_DB`)

    // Return products (or empty array if none found)
    return NextResponse.json(products, { status: 200 })
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
