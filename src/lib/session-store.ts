"use server"

import { cookies } from "next/headers"
import { getUserModel } from "@/models/user"
import { connectDB1 } from "@/lib/db"

interface UserData {
  _id: any
  name: string
  email: string
  type: "admin" | "seller" | "customer"
  onboardingStatus?: string
  lightOnboardingData?: any
  [key: string]: any
}

// Simple session storage without JWT
export async function createUserSession(user: any) {
  try {
    const sessionData = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      type: user.type,
      timestamp: Date.now(),
    }

    // Store as simple JSON string instead of JWT
    const sessionString = JSON.stringify(sessionData)

    const cookieStore = await cookies()
    cookieStore.set("user-session", sessionString, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("[v0] Session created for user:", user.email)
    return sessionData
  } catch (error) {
    console.error("[v0] Error creating session:", error)
    return null
  }
}

export async function getUserSession() {
  try {
    console.log("[v0] getUserSession called")

    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user-session")

    console.log("[v0] Session cookie exists:", !!sessionCookie?.value)

    if (!sessionCookie?.value) {
      console.log("[v0] No session cookie found")
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    console.log("[v0] Session data parsed:", { userId: sessionData.userId, email: sessionData.email })

    // Validate session is not expired (7 days)
    const sessionAge = Date.now() - sessionData.timestamp
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

    if (sessionAge > maxAge) {
      console.log("[v0] Session expired")
      await clearUserSession()
      return null
    }

    await connectDB1()
    console.log("[v0] Database connected, looking up user:", sessionData.userId)

    // Verify user still exists in database
    const UserModel = await getUserModel()
    const user = (await UserModel.findById(sessionData.userId).select("-password").lean()) as UserData | null

    console.log("[v0] User found in database:", !!user)

    if (!user) {
      console.log("[v0] User not found in database")
      await clearUserSession()
      return null
    }

    console.log("[v0] Session validated for user:", sessionData.email)

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      type: user.type,
      onboardingStatus: user.onboardingStatus || "pending",
      lightOnboardingData: user.lightOnboardingData,
    }
  } catch (error) {
    console.error("[v0] Error reading session:", error)
    return null
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete("user-session")
  cookieStore.delete("auth-token") // Also clear old JWT token if exists
  console.log("[v0] Session cleared")
}
