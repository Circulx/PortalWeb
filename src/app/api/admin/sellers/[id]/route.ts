import { NextResponse, type NextRequest } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

interface Params {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params
    const { status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Seller ID and status are required" }, { status: 400 })
    }

    if (!["Approved", "Reject", "Review"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const db = await connectProfileDB()
    const ProfileProgress = db.models.ProfileProgress

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id)

    // Find and update the profile progress based on userId
    const updatedProfile = await ProfileProgress.findOneAndUpdate(
      { userId: objectId.toString() }, // Use userId instead of _id
      { status },
      { new: true },
    )

    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Seller status updated successfully", updatedProfile })
  } catch (error) {
    console.error("Error updating seller status:", error)
    return NextResponse.json({ error: "Failed to update seller status" }, { status: 500 })
  }
}

