import { type NextRequest, NextResponse } from "next/server"
import { getUserModel } from "@/models/user"
import { connectDB1 } from "@/lib/db"
import { getUserSession } from "@/lib/session-store"

export async function GET(req: NextRequest) {
  try {
    console.log("[v0] Account details API called")

    await connectDB1()
    console.log("[v0] Database connected")

    const sessionUser = await getUserSession()
    console.log("[v0] Session user retrieved:", sessionUser ? sessionUser.email : "null")

    if (!sessionUser || !sessionUser.id) {
      console.log("[v0] Unauthorized - no session user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the user from the database
    const UserModel = await getUserModel()
    const user = await UserModel.findById(sessionUser.id).select("-password") // Exclude the password field

    if (!user) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] User data fetched successfully")
    // Return the user data
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB1()

    const { fullName, email, secondaryEmail, phoneNumber, country, state, zipCode } = await req.json()

    const sessionUser = await getUserSession()

    if (!sessionUser || !sessionUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the user from the database
    const UserModel = await getUserModel()
    const user = await UserModel.findById(sessionUser.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user details
    user.name = fullName || user.name
    user.email = email || user.email
    user.secondaryEmail = secondaryEmail || user.secondaryEmail
    user.phoneNumber = phoneNumber || user.phoneNumber
    user.country = country || user.country
    user.state = state || user.state
    user.zipCode = zipCode || user.zipCode

    await user.save()

    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
