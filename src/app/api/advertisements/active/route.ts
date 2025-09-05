import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

// Simple in-memory cache for advertisements
let advertisementCache: {
  data: any[]
  timestamp: number
  deviceType: string
  position: string
} | null = null

// Cache duration: 5 minutes (300,000 milliseconds)
const CACHE_DURATION = 5 * 60 * 1000

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("deviceType") || "all"
    const position = searchParams.get("position") || "all"

    // Check if we have valid cached data for this device type and position
    if (
      advertisementCache &&
      (advertisementCache.deviceType === deviceType || advertisementCache.deviceType === "all") &&
      (advertisementCache.position === position || advertisementCache.position === "all") &&
      Date.now() - advertisementCache.timestamp < CACHE_DURATION
    ) {
      const responseTime = Date.now() - startTime
      console.log(`Returning cached advertisements for device type: ${deviceType}, position: ${position} in ${responseTime}ms`)
      
      // Filter by device type and position if needed
      let filteredData = advertisementCache.data
      if (deviceType !== "all" && advertisementCache.deviceType === "all") {
        filteredData = filteredData.filter((ad) => 
          ad.deviceType === deviceType || ad.deviceType === "all"
        )
      }
      if (position !== "all" && advertisementCache.position === "all") {
        filteredData = filteredData.filter((ad) => 
          ad.position === position || ad.position === "all"
        )
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        cached: true,
        responseTime: responseTime,
      })
    }

    console.log(`Fetching fresh advertisements for device type: ${deviceType}, position: ${position}`)

    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const filter: any = { isActive: true }
    const now = new Date()

    // Date filter
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

    // Position filter
    if (position !== "all") {
      filter.position = { $in: [position, "all"] }
    }

    const advertisements = await Advertisement.find(filter)
      .select("title subtitle description imageUrl imageData linkUrl order deviceType position isActive")
      .sort({ order: 1, createdAt: -1 })
      .limit(10)
      .lean()
      .exec()

    const responseTime = Date.now() - startTime
    console.log(`Found ${advertisements.length} advertisements for device type: ${deviceType}, position: ${position} in ${responseTime}ms`)

    // Update cache
    advertisementCache = {
      data: advertisements,
      timestamp: Date.now(),
      deviceType: deviceType,
      position: position,
    }

    return NextResponse.json({
      success: true,
      data: advertisements,
      count: advertisements.length,
      cached: false,
      responseTime: responseTime,
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
