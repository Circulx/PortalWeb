import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// Cache for advertisements to avoid repeated database queries
let advertisementCache: {
  data: any[]
  timestamp: number
  deviceType: string
} | null = null

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes cache

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("deviceType") || "all"

    // Check if we have valid cached data for this device type
    if (
      advertisementCache &&
      advertisementCache.deviceType === deviceType &&
      Date.now() - advertisementCache.timestamp < CACHE_DURATION
    ) {
      console.log("Returning cached advertisements for device type:", deviceType)
      return NextResponse.json({
        success: true,
        data: advertisementCache.data,
        count: advertisementCache.data.length,
        cached: true,
      })
    }

    console.log("Fetching fresh advertisements for device type:", deviceType)

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    // Optimized query with proper indexing
    const filter: any = { isActive: true }
    const now = new Date()

    // Simplified date filter - only check if dates exist and are valid
    filter.$and = [
      {
        $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }],
      },
      {
        $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
      },
    ]

    // Device type filter
    if (deviceType !== "all") {
      filter.deviceType = { $in: [deviceType, "all"] }
    }

    // Get active advertisements with optimized query
    const advertisements = await Advertisement.find(filter)
      .select("title subtitle description imageUrl imageData linkUrl order deviceType isActive")
      .sort({ order: 1, createdAt: -1 })
      .limit(5)
      .lean()
      .exec()

    console.log(`Found ${advertisements.length} advertisements for device type: ${deviceType}`)

    // Cache the results
    advertisementCache = {
      data: advertisements,
      timestamp: Date.now(),
      deviceType: deviceType,
    }

    // Set cache headers for browser caching
    const response = NextResponse.json({
      success: true,
      data: advertisements,
      count: advertisements.length,
      cached: false,
    })

    // Cache for 5 minutes in browser
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600")

    return response
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
