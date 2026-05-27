import { NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/otp-service"
import { connectToProfileDB } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("[Verify OTP API] Received request")
    
    await connectToProfileDB()
    console.log("[Verify OTP API] Connected to DB")

    const body = await request.json()
    const { email, otp, type } = body

    console.log("[Verify OTP API] Request data:", { email, otp: otp?.substring(0, 3) + '***', type })

    // Validation
    if (!email || !otp || !type) {
      console.log("[Verify OTP API] Missing required fields")
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
    console.log("[Verify OTP API] Calling verifyOTP for:", email)
    const result = await verifyOTP(email.toLowerCase(), otp, type)
    console.log("[Verify OTP API] Verification result:", result)

    if (!result.success) {
      console.log("[Verify OTP API] Verification failed:", result.message)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      )
    }

    console.log("[Verify OTP API] OTP verified successfully for:", email)
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