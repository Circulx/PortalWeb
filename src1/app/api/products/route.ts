import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: Request) {
  try {
    console.log("=== PRODUCTS API CALLED ===")

    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "0", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    console.log(`Search params:`)
    console.log(`  - Query: "${query}"`)
    console.log(`  - Category: "${category}"`)
    console.log(`  - Limit: ${limit}`)
    console.log(`  - Offset: ${offset}`)

    // Build base filter for active, non-draft products
    const filter: any = {
      isActive: true,
      is_draft: false,
    }

    // Handle search query
    if (query.trim()) {
      console.log(`Processing search query: "${query}"`)

      // First check if the query exactly matches a category name
      const allCategories = await ProductModel.distinct("category_name", {
        isActive: true,
        is_draft: false,
        category_name: { $exists: true, $ne: null,  },
      })

      const isQueryACategory = allCategories.some((cat) => cat && cat.toLowerCase() === query.trim().toLowerCase())

      if (isQueryACategory) {
        // If query is a category name, show all products from that category
        console.log(`Query "${query}" matches a category, showing all products from this category`)
        filter.category_name = new RegExp(`^${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      } else {
        // Otherwise, perform text search across multiple fields
        console.log(`Performing text search for: "${query}"`)
        const searchRegex = { $regex: query.trim(), $options: "i" }
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
          { category_name: searchRegex },
          { sub_category_name: searchRegex },
        ]
      }
    }

    // Handle category filter (this overrides the query-based category detection)
    if (category.trim() && category !== "All Categories") {
      console.log(`Filtering by specific category: "${category}"`)
      filter.category_name = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      // Remove the $or condition if we're filtering by specific category
      if (filter.$or) {
        delete filter.$or
        console.log("Removed text search filter due to category filter")
      }
    }

    console.log("Final MongoDB filter:", JSON.stringify(filter, null, 2))

    // Build query
    let productsQuery = ProductModel.find(filter).lean().select({
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
      brand: 1,
      original_price: 1,
      units: 1,
      delivery_option: 1,
      created_at: 1,
    })

    // Apply pagination if specified
    if (offset > 0) {
      productsQuery = productsQuery.skip(offset)
      console.log(`Applied offset: ${offset}`)
    }
    if (limit > 0) {
      productsQuery = productsQuery.limit(limit)
      console.log(`Applied limit: ${limit}`)
    }

    // Execute query
    const startTime = Date.now()
    const products = await productsQuery
    const queryTime = Date.now() - startTime

    console.log(`=== QUERY RESULTS ===`)
    console.log(`Found ${products.length} products (query time: ${queryTime}ms)`)

    // Log sample results for debugging
    if (products.length > 0) {
      console.log("Sample products found:")
      products.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. "${p.title}" (Category: "${p.category_name}", Brand: "${p.brand}")`)
      })
    } else {
      console.log("❌ NO PRODUCTS FOUND!")

      // Debug: Check if there are any products in the specified category
      if (category && category !== "All Categories") {
        const categoryCount = await ProductModel.countDocuments({
          isActive: true,
          is_draft: false,
          category_name: new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        })
        console.log(`Debug: Total products in category "${category}": ${categoryCount}`)

        // Check exact category names in database
        const exactCategories = await ProductModel.distinct("category_name", {
          isActive: true,
          is_draft: false,
        })
        console.log("All available categories in DB:", exactCategories)
      }

      // Debug: Check total active products
      const totalActiveProducts = await ProductModel.countDocuments({
        isActive: true,
        is_draft: false,
      })
      console.log(`Debug: Total active products in DB: ${totalActiveProducts}`)
    }

    // Transform products to ensure consistent format
    const transformedProducts = products.map((product) => ({
      product_id: product.product_id || product._id?.toString(),
      title: product.title || "",
      description: product.description || "",
      image_link: product.image_link || "/placeholder.svg?height=200&width=200",
      stock: product.stock || 0,
      price: product.price || 0,
      discount: product.discount || 0,
      SKU: product.SKU || "",
      seller_id: product.seller_id || 0,
      rating: product.rating || 0,
      seller_name: product.seller_name || "",
      location: product.location || "Delhi",
      category_name: product.category_name || "",
      sub_category_name: product.sub_category_name || "",
      brand: product.brand || "",
      original_price: product.original_price || product.price || 0,
      units: product.units || "",
      delivery_option: product.delivery_option || "Free Delivery Available",
      created_at: product.created_at,
    }))

    console.log(`=== RETURNING ${transformedProducts.length} TRANSFORMED PRODUCTS ===`)

    // Add cache headers
    const response = NextResponse.json(transformedProducts, { status: 200 })
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ ERROR in products API:", errorMessage)
    console.error("Stack trace:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()
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
