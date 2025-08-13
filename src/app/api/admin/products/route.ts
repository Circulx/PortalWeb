import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()

    const Product = connection.models.Product

    if (!Product) {
      console.error("Product model not found in profileDb connection")
      return NextResponse.json({ error: "Product model not available" }, { status: 500 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || "all"
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    // Build the query
    const query: Record<string, any> = {}

    if (status !== "all") {
      if (status.toLowerCase() === "pending") {
        // For pending filter, include products with explicit "Pending" status OR no status field
        query.$or = [
          { status: "Pending" },
          { status: "pending" },
          { status: { $exists: false } },
          { status: null },
          { status: "" },
        ]
      } else {
        // For other statuses, only look for explicit matches
        query.$or = [
          { status: status },
          { status: status.toLowerCase() },
          { status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() },
        ]
      }
    }

    // Add date filter if month and year are provided
    if (month && year) {
      const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
      const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0)

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    // Get products with pagination
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .select(
        "product_id title image_link seller_name emailId status commission price commission_type commission_value final_price created_at",
      )
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const productsWithStatus = products.map((product: any) => ({
      ...product,
      status: product.status || "Pending",
      commission: product.commission || "No",
      price: product.price || 0,
      commission_type: product.commission_type || "percentage",
      commission_value: product.commission_value || 0,
      final_price: product.final_price || product.price || 0,
      seller_name: product.seller_name || product.emailId || "Unknown Seller",
    }))

    console.log(`Fetched ${products.length} products from PROFILE_DB with status filter: ${status}`)

    return NextResponse.json({
      products: productsWithStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: unknown) {
    console.error("Error fetching products from PROFILE_DB:", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.json(
      { error: "Failed to fetch products", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
