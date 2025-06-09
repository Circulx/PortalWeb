import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest) {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { searchParams } = new URL(request.url)
    const deviceType = searchParams.get("deviceType") || "all"

    console.log("Fetching active advertisements for device type:", deviceType)

    // Build filter for active advertisements
    const filter: any = { isActive: true }

    // Add date filter for scheduled advertisements
    const now = new Date()
    filter.$or = [
      { startDate: { $exists: false }, endDate: { $exists: false } },
      { startDate: { $lte: now }, endDate: { $exists: false } },
      { startDate: { $exists: false }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
    ]

    // Device type filter
    if (deviceType !== "all") {
      filter.deviceType = { $in: [deviceType, "all"] }
    }

    console.log("Advertisement filter:", JSON.stringify(filter, null, 2))

    // Get active advertisements (max 5)
    const advertisements = await Advertisement.find(filter).sort({ order: 1, createdAt: -1 }).limit(5).lean()

    console.log("Found advertisements:", advertisements.length)
    console.log("Advertisements data:", advertisements)

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
