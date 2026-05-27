import { NextRequest, NextResponse } from "next/server"
import { sendSignupOTP, sendLoginOTP, sendPasswordResetOTP } from "@/lib/otp-service"
import { getUserModel } from "@/models/user"
import { connectToProfileDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    await connectToProfileDB()
    const User = await getUserModel()

    const body = await request.json()
    const { email, type } = body

    // Validation
    if (!email || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and type are required",
        },
        { status: 400 }
      )
    }

    if (!["signup", "login", "password-reset"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP type",
        },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      )
    }

    // For login, check if user exists
    if (type === "login") {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      })

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            message:
              "No account found with this email. Please sign up first.",
          },
          { status: 404 }
        )
      }
    }

    // For signup, check if user already exists
    if (type === "signup") {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      })

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this email already exists. Please login instead.",
          },
          { status: 409 }
        )
      }
    }

    // For password reset, check if user exists
    if (type === "password-reset") {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      })

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "No account found with this email.",
          },
          { status: 404 }
        )
      }
    }

    // Send OTP
    let result
    if (type === "signup") {
      result = await sendSignupOTP(email)
    } else if (type === "login") {
      result = await sendLoginOTP(email)
    } else {
      result = await sendPasswordResetOTP(email)
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        expiresIn: result.expiresIn,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Send OTP API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    )
  }
}
