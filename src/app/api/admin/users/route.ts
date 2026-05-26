import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getUserModel } from "@/models/user"

export async function GET(request: NextRequest) {
  try {
    // Use connectProfileDB to ensure we're using the same database as login/signup
    await connectProfileDB()

    // Get the User model with the correct connection
    const UserModel = await getUserModel()

    // Fetch all users from the correct database
    const users = await UserModel.find({}).select("-password").sort({ createdAt: -1 })

    const serializedUsers = users.map((user, index) => ({
      id: user._id.toString(),
      sno: index + 1,
      name: user.name,
      email: user.email,
      role: user.type,
    }))

    return NextResponse.json({ users: serializedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
