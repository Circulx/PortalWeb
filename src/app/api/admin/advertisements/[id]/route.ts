import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { id } = params
    console.log("Fetching advertisement with ID:", id)

    const advertisement = await Advertisement.findById(id).lean()

    if (!advertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "Advertisement not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: advertisement,
    })
  } catch (error) {
    console.error("Error fetching advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch advertisement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { id } = params
    const body = await request.json()
    console.log("Updating advertisement with ID:", id, "Data:", body)

    const updatedAdvertisement = await Advertisement.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updatedAdvertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "Advertisement not found",
        },
        { status: 404 },
      )
    }

    console.log("Advertisement updated successfully:", updatedAdvertisement._id)

    return NextResponse.json({
      success: true,
      data: updatedAdvertisement,
      message: "Advertisement updated successfully",
    })
  } catch (error) {
    console.error("Error updating advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update advertisement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to the profile database
    const connection = await connectProfileDB()
    const Advertisement = connection.models.Advertisement

    if (!Advertisement) {
      throw new Error("Advertisement model not found")
    }

    const { id } = params
    console.log("Deleting advertisement with ID:", id)

    const deletedAdvertisement = await Advertisement.findByIdAndDelete(id).lean()

    if (!deletedAdvertisement) {
      return NextResponse.json(
        {
          success: false,
          error: "Advertisement not found",
        },
        { status: 404 },
      )
    }

    console.log("Advertisement deleted successfully:", deletedAdvertisement._id)

    return NextResponse.json({
      success: true,
      data: deletedAdvertisement,
      message: "Advertisement deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting advertisement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete advertisement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
