import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// Define the Product interface to ensure TypeScript knows about the stock property
interface Product {
  product_id: number
  stock: number
  [key: string]: any // For other properties
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()

    // Get the Product model from the connection
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Find the product by product_id - explicitly cast the result to Product type
    const product = (await ProductModel.findOne({ product_id: Number(id) }).lean()) as Product | null

    if (!product) {
      console.error(`Product with ID ${id} not found in PROFILE_DB`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Return the stock of the product
    return NextResponse.json({ stock: product.stock }, { status: 200 })
  } catch (error) {
    console.error("Error fetching product stock:", error)
    return NextResponse.json({ error: "Error fetching product stock" }, { status: 500 })
  }
}
