import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose, { type Model, type Document } from "mongoose"

// Define a basic interface for the Product document
interface ProductDocument extends Document {
  status?: string
  createdAt?: Date
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the profile database
    const db = await connectProfileDB()

    // Get the products collection
    let Product: Model<ProductDocument>
    try {
      // Try to get the existing model
      Product = db.models.Product as Model<ProductDocument>
    } catch (e) {
      // If model doesn't exist, create a new one with an empty schema
      const schema = new mongoose.Schema(
        {
          status: String,
          createdAt: Date,
        },
        { strict: false },
      )
      Product = db.model<ProductDocument>("Product", schema)
    }

    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || "all"
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    // Build the query
    const query: Record<string, any> = {}

    // Add status filter if not "all"
    if (status !== "all") {
      query.status = status
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

    // Get products
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    // Add default status if not present
    const productsWithStatus = products.map((product) => ({
      ...product,
      status: product.status || "Pending",
    }))

    return NextResponse.json({
      products: productsWithStatus,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: unknown) {
    console.error("Error fetching products:", error instanceof Error ? error.message : "Unknown error")

    return NextResponse.json(
      { error: "Failed to fetch products", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
