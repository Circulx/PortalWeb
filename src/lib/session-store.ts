"use server"

import { cookies } from "next/headers"
import { getUserModel } from "@/models/user"

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
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user-session")

    if (!sessionCookie?.value) {
      console.log("[v0] No session cookie found")
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)

    // Validate session is not expired (7 days)
    const sessionAge = Date.now() - sessionData.timestamp
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

    if (sessionAge > maxAge) {
      console.log("[v0] Session expired")
      await clearUserSession()
      return null
    }

    // Verify user still exists in database
    const UserModel = await getUserModel()
    const user = await UserModel.findById(sessionData.userId).select("-password").lean()

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
      onboardingStatus: (user as any).onboardingStatus || "pending",
      lightOnboardingData: (user as any).lightOnboardingData,
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
