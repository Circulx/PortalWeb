import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// Enhanced cache with multiple layers
let advertisementCache: {
  data: any[]
  timestamp: number
  deviceType: string
} | null = null

const CACHE_DURATION = 3 * 60 * 1000

let isPreWarming = false

async function preWarmCache() {
  if (isPreWarming) return
  isPreWarming = true

  try {
    console.log("Pre-warming advertisement cache...")
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      console.error("Advertisement model not found during pre-warm")
      return
    }

    const filter: any = { isActive: true }
    const now = new Date()

    filter.$and = [
      {
        $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }],
      },
      {
        $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
      },
    ]

    const advertisements = await Advertisement.find(filter)
      .select("title subtitle description imageUrl imageData linkUrl order deviceType isActive")
      .sort({ order: 1, createdAt: -1 })
      .limit(15) // Increased limit for better coverage
      .lean()
      .exec()

    // Cache for 'all' device types initially
    advertisementCache = {
      data: advertisements,
      timestamp: Date.now(),
      deviceType: "all",
    }

    console.log(`Pre-warmed cache with ${advertisements.length} advertisements`)
  } catch (error) {
    console.error("Error pre-warming advertisement cache:", error)
  } finally {
    isPreWarming = false
  }
}

preWarmCache()
setInterval(preWarmCache, 5 * 60 * 1000) // Refresh every 5 minutes

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("deviceType") || "all"

    // Check if we have valid cached data for this device type
    if (
      advertisementCache &&
      (advertisementCache.deviceType === deviceType || advertisementCache.deviceType === "all") &&
      Date.now() - advertisementCache.timestamp < CACHE_DURATION
    ) {
      const responseTime = Date.now() - startTime
      console.log(`Returning cached advertisements for device type: ${deviceType} in ${responseTime}ms`)

      // Filter by device type if needed
      let filteredData = advertisementCache.data
      if (deviceType !== "all" && advertisementCache.deviceType === "all") {
        filteredData = advertisementCache.data.filter((ad) => ad.deviceType === deviceType || ad.deviceType === "all")
      }

      const response = NextResponse.json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        cached: true,
        responseTime: responseTime,
      })

      response.headers.set("Cache-Control", "public, max-age=180, stale-while-revalidate=600")
      response.headers.set("X-Response-Time", `${responseTime}ms`)

      return response
    }

    console.log(`Fetching fresh advertisements for device type: ${deviceType}`)

    // Connect to the profile database with optimized connection
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    // Optimized query with proper indexing
    const filter: any = { isActive: true }
    const now = new Date()

    // Simplified date filter for better performance
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
      .limit(15) // Increased limit for better coverage
      .lean()
      .exec()

    const responseTime = Date.now() - startTime
    console.log(`Found ${advertisements.length} advertisements for device type: ${deviceType} in ${responseTime}ms`)

    // Update cache
    advertisementCache = {
      data: advertisements,
      timestamp: Date.now(),
      deviceType: deviceType,
    }

    const response = NextResponse.json({
      success: true,
      data: advertisements,
      count: advertisements.length,
      cached: false,
      responseTime: responseTime,
    })

    response.headers.set("Cache-Control", "public, max-age=180, stale-while-revalidate=600")
    response.headers.set("X-Response-Time", `${responseTime}ms`)

    return response
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("Error fetching active advertisements:", error)

    // Return cached data if available, even if stale
    if (advertisementCache && advertisementCache.data.length > 0) {
      console.log("Returning stale cached data due to error")
      const response = NextResponse.json({
        success: true,
        data: advertisementCache.data,
        count: advertisementCache.data.length,
        cached: true,
        stale: true,
        responseTime: responseTime,
      })
      response.headers.set("X-Response-Time", `${responseTime}ms`)
      return response
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch advertisements",
        details: error instanceof Error ? error.message : "Unknown error",
        responseTime: responseTime,
      },
      { status: 500 },
    )
  }
}
