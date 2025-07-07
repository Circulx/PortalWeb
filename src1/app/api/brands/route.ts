import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: Request) {
  try {
    console.log("Fetching brands from PROFILE_DB")
    // Connect to the PROFILE_DB database
    const connection = await connectProfileDB()

    // Get the Product model from the connection
    const ProductModel = connection.models.Product

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB")
      return NextResponse.json({ error: "Product model not found" }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10)

    // Aggregate brands with product counts - only from active products
    const brandsAggregation = await ProductModel.aggregate([
      // Match only active products that are not drafts and have a brand
      {
        $match: {
          isActive: true,
          is_draft: false,
          $and: [
            { $or: [{ brand: { $exists: true } }, { seller_name: { $exists: true } }] },
            { $or: [{ brand: { $ne: null } }, { seller_name: { $ne: null } }] },
            { $or: [{ brand: { $ne: "" } }, { seller_name: { $ne: "" } }] },
          ],
        },
      },
      // Group by brand (use seller_name as fallback if brand is not available)
      {
        $group: {
          _id: {
            $cond: {
              if: { $and: [{ $ne: ["$brand", null] }, { $ne: ["$brand", ""] }] },
              then: "$brand",
              else: "$seller_name",
            },
          },
          productCount: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalStock: { $sum: "$stock" },
          avgRating: { $avg: "$rating" },
          sampleImage: { $first: "$image_link" },
          categories: { $addToSet: "$category_name" },
        },
      },
      // Filter out null or empty brand names
      
      // Sort by product count (descending) to get trending brands
      {
        $sort: { productCount: -1 },
      },
      // Limit results
      {
        $limit: limit,
      },
      // Project final structure
      {
        $project: {
          _id: 0,
          name: "$_id",
          productCount: 1,
          avgPrice: { $round: ["$avgPrice", 2] },
          totalStock: 1,
          avgRating: { $round: ["$avgRating", 1] },
          sampleImage: 1,
          categories: 1,
          href: {
            $concat: ["/brands/", { $toLower: { $replaceAll: { input: "$_id", find: " ", replacement: "-" } } }],
          },
        },
      },
    ])

    console.log(`Found ${brandsAggregation.length} trending brands in PROFILE_DB`)

    // Add cache headers for better performance
    const response = NextResponse.json(brandsAggregation, { status: 200 })

    // Cache for 10 minutes for better performance
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200")

    return response
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching brands from PROFILE_DB:", errorMessage)
    return NextResponse.json({ error: "Error fetching brands" }, { status: 500 })
  }
}
