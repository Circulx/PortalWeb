import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    console.log("Current user:", user ? { id: user.id, type: user.type } : "No user")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const isActive = searchParams.get("isActive")
    const deviceType = searchParams.get("deviceType")
    const position = searchParams.get("position")

    console.log("Fetching advertisements with params:", { page, limit, isActive, deviceType, position })

    // Build filter
    const filter: any = {}
    if (isActive !== null && isActive !== "") {
      filter.isActive = isActive === "true"
    }
    if (deviceType && deviceType !== "all") {
      filter.deviceType = deviceType
    }
    if (position && position !== "all") {
      filter.position = position
    }

    console.log("Advertisement filter:", filter)

    // Get total count
    const total = await Advertisement.countDocuments(filter)
    console.log("Total advertisements found:", total)

    // Get advertisements with pagination
    const advertisements = await Advertisement.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    console.log("Fetched advertisements:", advertisements.length)
    console.log("Advertisement data:", advertisements)

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }

    return NextResponse.json({
      success: true,
      data: {
        advertisements,
        pagination,
      },
    })
  } catch (error) {
    console.error("Error fetching advertisements:", error)
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

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    console.log("Current user:", user ? { id: user.id, type: user.type } : "No user")

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const body = await request.json()
    console.log("Creating advertisement with data:", body)

    // Only validate required fields - title, subtitle, description are now optional
    const { imageUrl, imageData } = body

    if (!imageUrl && !imageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Image is required. Please provide either imageUrl or imageData",
        },
        { status: 400 },
      )
    }

    // Create new advertisement with optional fields
    const advertisement = new Advertisement({
      title: body.title || "", // Default to empty string if not provided
      subtitle: body.subtitle || "", // Default to empty string if not provided
      description: body.description || "", // Default to empty string if not provided
      imageUrl: imageUrl || "",
      imageData: imageData || "",
      linkUrl: body.linkUrl || "",
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: body.order || 1,
      deviceType: body.deviceType || "all",
      position: body.position || "all",
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    })

    const savedAdvertisement = await advertisement.save()
    console.log("Advertisement saved successfully:", savedAdvertisement._id)

    return NextResponse.json({
      success: true,
      data: savedAdvertisement,
      message: "Advertisement created successfully",
    })
  } catch (error) {
    console.error("Error creating advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create advertisement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
