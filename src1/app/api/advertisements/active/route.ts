import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Starting advertisement fetch ===")

    // Connect to the profile database
    const connection = await connectProfileDB()
    console.log("Database connection established")

    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      console.error("Advertisement model not found in connection.models")
      console.log("Available models:", Object.keys(connection.models))
      throw new Error("Advertisement model not found")
    }

    console.log("Advertisement model found successfully")

    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("deviceType") || "all"

    console.log("Fetching active advertisements for device type:", deviceType)

    // First, let's check if there are any documents in the collection
    const totalCount = await Advertisement.countDocuments({})
    console.log("Total advertisements in collection:", totalCount)

    // Get all documents first to debug
    const allAds = await Advertisement.find({}).lean()
    console.log("All advertisements in collection:", JSON.stringify(allAds, null, 2))

    // Build filter for active advertisements
    const filter: any = { isActive: true }

    // Add date filter for scheduled advertisements - FIXED to handle null values
    const now = new Date()
    filter.$or = [
      // No dates or null dates
      {
        $and: [
          { $or: [{ startDate: { $exists: false } }, { startDate: null }] },
          { $or: [{ endDate: { $exists: false } }, { endDate: null }] },
        ],
      },
      // Start date valid, no end date or null end date
      { $and: [{ startDate: { $lte: now } }, { $or: [{ endDate: { $exists: false } }, { endDate: null }] }] },
      // No start date or null start date, end date valid
      { $and: [{ $or: [{ startDate: { $exists: false } }, { startDate: null }] }, { endDate: { $gte: now } }] },
      // Both dates valid
      { $and: [{ startDate: { $lte: now } }, { endDate: { $gte: now } }] },
    ]

    // Device type filter
    if (deviceType !== "all") {
      filter.deviceType = { $in: [deviceType, "all"] }
    }

    console.log("Advertisement filter:", JSON.stringify(filter, null, 2))

    // Get active advertisements (max 5)
    let advertisements = await Advertisement.find(filter).sort({ order: 1, createdAt: -1 }).limit(5).lean()

    console.log("Found advertisements with complex filter:", advertisements.length)

    // If no ads found with filter, try a simpler query
    if (advertisements.length === 0) {
      console.log("No ads found with complex filter, trying simple isActive query...")
      advertisements = await Advertisement.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).limit(5).lean()
      console.log("Simple query found advertisements:", advertisements.length)
    }

    console.log("Final advertisements data:", JSON.stringify(advertisements, null, 2))

    return NextResponse.json({
      success: true,
      data: advertisements,
      count: advertisements.length,
    })
  } catch (error) {
    console.error("Error fetching active advertisements:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch advertisements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
