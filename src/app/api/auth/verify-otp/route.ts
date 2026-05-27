import { NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/otp-service"
import { connectToProfileDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    await connectToProfileDB()

    const body = await request.json()
    const { email, otp, type } = body

    // Validation
    if (!email || !otp || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, OTP, and type are required",
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

    // OTP should be 6 digits
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP must be 6 digits",
        },
        { status: 400 }
      )
    }

    // Verify OTP
    const result = await verifyOTP(email.toLowerCase(), otp, type)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Verify OTP API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    )
  }
}
