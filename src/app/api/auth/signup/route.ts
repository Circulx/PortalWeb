import { NextRequest, NextResponse } from "next/server"
import { getUserModel } from "@/models/user"
import { isOTPVerified, deleteOTP } from "@/lib/otp-service"
import { connectToProfileDB } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/welcome-email"

export async function POST(request: NextRequest) {
  try {
    // Ensure profile DB is connected (for OTP check)
    await connectToProfileDB()

    const body = await request.json()
    const { name, email: rawEmail, phone: rawPhone, password, userType = "customer" } = body

    const email = (rawEmail as string).toLowerCase().trim()
    const phone = (rawPhone as string).replace(/\D/g, "")

    // Basic validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Full name is required" }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 })
    }
    if (!phone || phone.length < 10 || phone.length > 15) {
      return NextResponse.json({ success: false, message: "Phone number must be 10-15 digits" }, { status: 400 })
    }

    // Check OTP verification status
    const otpVerified = await isOTPVerified(email, "signup")
    if (!otpVerified) {
      return NextResponse.json(
        { success: false, message: "Email not verified. Please verify your email with OTP first." },
        { status: 400 }
      )
    }

    // Get user model (connects to DB1)
    const UserModel = await getUserModel()

    // Check existing email
    const existingEmail = await UserModel.findOne({ email })
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 })
    }

    // Check existing phone
    const existingPhone = await UserModel.findOne({ phone })
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "This phone number is already registered with another account" },
        { status: 400 }
      )
    }

    // Hash password
    let hashedPassword: string
    if (password && password.trim()) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 8 characters long" },
          { status: 400 }
        )
      }
      hashedPassword = await bcrypt.hash(password, 10)
    } else {
      const randomPassword = Math.random().toString(36).slice(-12)
      hashedPassword = await bcrypt.hash(randomPassword, 10)
    }

    // Create user
    const user = await UserModel.create({
      name: name.trim(),
      email,
      phone,
      password: hashedPassword,
      type: userType,
      emailVerified: true,
    })

    // Clean up OTP record
    await deleteOTP(email, "signup")

    // Send welcome email asynchronously (non-blocking) - doesn't affect signup success
    sendWelcomeEmail(email, name.trim()).catch((error) => {
      console.error("[Signup API] Error sending welcome email:", error)
      // Don't throw error - signup already succeeded
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          type: user.type,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Signup API] Error:", error)
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 })
  }
}