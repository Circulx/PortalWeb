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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const isActive = searchParams.get("isActive")
    const deviceType = searchParams.get("deviceType")

    console.log("Fetching advertisements with params:", { page, limit, isActive, deviceType })

    // Build filter
    const filter: any = {}
    if (isActive !== null && isActive !== "") {
      filter.isActive = isActive === "true"
    }
    if (deviceType && deviceType !== "all") {
      filter.deviceType = deviceType
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
    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const body = await request.json()
    console.log("Creating advertisement with data:", body)

    // Validate required fields
    const { title, subtitle, description, imageUrl, isActive, order, deviceType } = body

    if (!title || !subtitle || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, subtitle, description",
        },
        { status: 400 },
      )
    }

    // Create new advertisement
    const advertisement = new Advertisement({
      title,
      subtitle,
      description,
      imageUrl: imageUrl || "",
      linkUrl: body.linkUrl || "",
      isActive: isActive !== undefined ? isActive : true,
      order: order || 1,
      deviceType: deviceType || "all",
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
