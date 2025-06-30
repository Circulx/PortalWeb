import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET() {
  try {
    console.log("Fetching categories from PROFILE_DB")
    const connection = await connectProfileDB()
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Get unique categories with product counts
    const categories = await ProductModel.aggregate([
      {
        $match: {
          isActive: true,
          is_draft: false,
          category_name: { $exists: true, $ne: null, },
        },
      },
      {
        $group: {
          _id: "$category_name",
          count: { $sum: 1 },
          // Get a sample image for each category
          sampleImage: { $first: "$image_link" },
          // Get average price for the category
          avgPrice: { $avg: "$price" },
          // Get subcategories
          subcategories: { $addToSet: "$sub_category_name" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
          sampleImage: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          subcategories: {
            $filter: {
              input: "$subcategories",
              cond: { $and: [{ $ne: ["$$this", null] }, { $ne: ["$$this", ""] }] },
            },
          },
        },
      },
      {
        $sort: { count: -1 }, // Sort by product count descending
      },
    ])

    console.log(`Found ${categories.length} categories`)

    // Add cache headers for better performance
    const response = NextResponse.json(categories, { status: 200 })
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200") // Cache for 10 minutes

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching categories:", errorMessage)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}
