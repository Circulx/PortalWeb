import { type NextRequest, NextResponse } from "next/server"
import { connectDB1 } from "@/lib/db"
import { getUserModel } from "@/models/user"
import { sendEmail } from "@/lib/email"
import { generateRoleUpdateEmail } from "@/lib/email-templates"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "seller", "customer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be admin, seller, or customer" }, { status: 400 })
    }

    // Use connectDB1 to ensure we're using the same database as login/signup
    await connectDB1()

    // Get the User model with the correct connection
    const UserModel = await getUserModel()

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId)

    // Get current user to capture previous role and name/email
    const currentUser = await UserModel.findById(objectId).select("name email type")
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const previousRole = currentUser.type || "customer"

    // Update user type in the correct database
    const updatedUser = await UserModel.findByIdAndUpdate(objectId, { type: role }, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Send role update email asynchronously (don't block the response)
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("origin") ?? "https://ind2b.com")

    sendEmail({
      to: updatedUser.email,
      subject: `Your IND2B Account Role Has Been Updated to ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      html: generateRoleUpdateEmail({
        name: updatedUser.name,
        email: updatedUser.email,
        newRole: role as "admin" | "seller" | "customer",
        previousRole,
        appUrl,
      }),
    }).catch((err) => {
      // Log but don't fail — role is already updated in DB
      console.error("[update-role] Failed to send role update email:", err)
    })

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.type,
      },
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
  }
}