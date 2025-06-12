import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

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

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "0", 10) // Default to 0 (no limit) like before
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    const category = searchParams.get("category")

    // Build filter: only fetch products that are active and not drafts
    const filter: any = { isActive: true, is_draft: false }

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category_name: { $regex: query, $options: "i" } },
        { sub_category_name: { $regex: query, $options: "i" } },
      ]
    }

    if (category) {
      filter.category_name = { $regex: category, $options: "i" }
    }

    // Query the database - optimized for faster response
    let productsQuery = ProductModel.find(filter)
      .lean() // Use lean() for better performance
      .select({
        // Select only necessary fields to reduce payload
        product_id: 1,
        title: 1,
        description: 1,
        image_link: 1,
        stock: 1,
        price: 1,
        discount: 1,
        SKU: 1,
        seller_id: 1,
        rating: 1,
        seller_name: 1,
        location: 1,
        category_name: 1,
        sub_category_name: 1,
        created_at: 1,
      })

    // Only apply pagination if limit is specified and > 0
    if (offset > 0) {
      productsQuery = productsQuery.skip(offset)
    }

    if (limit > 0) {
      productsQuery = productsQuery.limit(limit)
    }

    const startTime = Date.now()
    const products = await productsQuery
    const queryTime = Date.now() - startTime

    console.log(`Found ${products.length} active products in PROFILE_DB (query time: ${queryTime}ms)`)

    // Add cache headers for better performance
    const response = NextResponse.json(products, { status: 200 })

    // Cache for 5 minutes for better performance
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")

    return response
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
