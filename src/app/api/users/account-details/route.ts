import { type NextRequest, NextResponse } from "next/server"
import { connectDB1 } from "@/lib/db"
import jwt from "jsonwebtoken"
import { getUserModel } from "@/models/user"
import { sanitizeInput } from "@/lib/apiUtils"
import { validatePayloadSize } from "@/lib/apiUtils"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

export async function GET(req: NextRequest) {
  try {
    await connectDB1()

    // Get the auth token from cookies
    const cookieStore = req.cookies
    const token = cookieStore.get("auth-token")

    if (!token || !token.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Decode the JWT token to get the user ID
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Use the Mongoose model instead of direct DB access
    const UserModel = await getUserModel()
    const user = await UserModel.findById(userId).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User data retrieved:", Object.keys(user.toObject()))
    console.log("Profile image exists:", !!user.profileImage)

    // Return the user data
    return NextResponse.json(user.toObject(), { status: 200 })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB1()

    const {
      fullName,
      email,
      secondaryEmail,
      phoneNumber,
      country,
      state,
      zipCode,
      profileImage,
      addressLine1,
      addressLine2,
      district,
      wardNo,
    } = await req.json()

    // Get the auth token from cookies
    const cookieStore = req.cookies
    const token = cookieStore.get("auth-token")

    if (!token || !token.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Decode the JWT token to get the user ID
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    console.log("Updating user with ID:", userId)

    // Use the Mongoose model instead of direct DB access
    const UserModel = await getUserModel()

    // First check if the user exists
    const userExists = await UserModel.findById(userId)
    if (!userExists) {
      console.error("User not found with ID:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      name: fullName,
      email: email,
    }

    // Add optional fields if they exist
    if (secondaryEmail !== undefined) updateData.secondaryEmail = secondaryEmail
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (country !== undefined) updateData.country = country
    if (state !== undefined) updateData.state = state
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2
    if (district !== undefined) updateData.district = district
    if (wardNo !== undefined) updateData.wardNo = wardNo

    // Handle profile image
    if (profileImage === null) {
      // If null is explicitly passed, remove the profile image
      updateData.profileImage = null
      console.log("Setting profileImage to null")
    } else if (profileImage) {
      // If a new image is provided, update it
      // Check if image is too large (MongoDB document limit is 16MB)
      if (profileImage.length > 1024 * 1024 * 5) {
        // 5MB limit to be safe
        return NextResponse.json({ error: "Image is too large. Please use a smaller image." }, { status: 400 })
      }

      updateData.profileImage = profileImage
      console.log("Setting profileImage, length:", profileImage.length)
    }

    // Validate payload size
    if (!validatePayloadSize(updateData)) {
      console.error("Payload size exceeds limit")
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    // Sanitize input
    Object.keys(updateData).forEach((key) => {
      if (typeof updateData[key] === "string") {
        updateData[key] = sanitizeInput(updateData[key])
      }
    })

    console.log("Update data fields:", Object.keys(updateData))

    // Update the user using findByIdAndUpdate for better error handling
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true },
    )

    if (!updatedUser) {
      console.error("Failed to update user, result is null")
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    console.log("User updated successfully")
    console.log("Updated user fields:", Object.keys(updatedUser.toObject()))
    console.log("Profile image saved:", !!updatedUser.profileImage)

    if (updatedUser.profileImage) {
      console.log("Saved profile image length:", updatedUser.profileImage.length)
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profileImageSaved: !!updatedUser.profileImage,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
