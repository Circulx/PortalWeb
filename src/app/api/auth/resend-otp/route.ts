import { NextRequest, NextResponse } from "next/server"
import { resendOTP } from "@/lib/otp-service"
import { connectToProfileDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    await connectToProfileDB()

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

    if (!["signup", "login"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP type",
        },
        { status: 400 }
      )
    }

    // Resend OTP
    const result = await resendOTP(email.toLowerCase(), type)

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
    console.error("[Resend OTP API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    )
  }
}
