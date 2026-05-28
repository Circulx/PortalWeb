"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserModel } from "@/models/user"
import type { IUser } from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { isOTPVerified, deleteOTP } from "@/lib/otp-service"
import { sendWelcomeEmail } from "@/lib/welcome-email"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

function isValidGSTNumber(gstNumber: string): boolean {
  const cleanGST = gstNumber.replace(/\s/g, "").toUpperCase()

  // Check length - GST must be 15 characters
  if (cleanGST.length !== 15) {
    return false
  }

  // Basic GST format: 2 digits + 10 alphanumeric + 1 digit + Z + 1 alphanumeric
  const gstRegex = /^[0-9]{2}[A-Z0-9]{10}[0-9][A-Z][0-9A-Z]$/

  return gstRegex.test(cleanGST)
}

export async function signIn(formData: FormData) {
  try {
    const UserModel = await getUserModel()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const requiredRole = formData.get("requiredRole") as string | null

    const user = await UserModel.findOne({ email })
    if (!user) {
      return { error: "User not found" }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { error: "Invalid credentials" }
    }

    // If a specific role is required, check if user has that role
    if (requiredRole && user.type !== requiredRole) {
      return { 
        error: `Access denied. Only ${requiredRole} users can access this portal.`,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          type: user.type,
        }
      }
    }

    const token = jwt.sign({ userId: user._id, type: user.type }, JWT_SECRET, { expiresIn: "1d" })

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 1, // 1 days
    })

    return {
      success: true,
      message: "Signed in successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in signIn:", error)
    return { error: "Something went wrong" }
  }
}

export async function signUp(formData: FormData) {
  try {
    const UserModel = await getUserModel()

    const name = formData.get("name") as string
    const email = (formData.get("email") as string).toLowerCase()
    const phone = (formData.get("phone") as string).replace(/\D/g, "") // Remove non-digits
    const userType = (formData.get("userType") as string) || "customer"
    const gstNumber = formData.get("gstNumber") as string
    const passwordInput = formData.get("password") as string

    // Validate name
    if (!name || name.trim().length === 0) {
      return { error: "Full name is required" }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" }
    }

    // Validate phone
    if (!phone || phone.length < 10 || phone.length > 15) {
      return { error: "Phone number must be 10-15 digits" }
    }

    // Check if email is OTP verified
    const isOTPVerifiedStatus = await isOTPVerified(email, "signup")
    if (!isOTPVerifiedStatus) {
      return { error: "Please verify your email with OTP first" }
    }

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return { error: "Email already exists" }
    }

    // Check if phone already exists (unique constraint)
    const existingPhone = await UserModel.findOne({ phone })
    if (existingPhone) {
      return { error: "This phone number is already registered with another account" }
    }

    if (userType === "seller") {
      if (!gstNumber) {
        return { error: "GST Number is required for sellers" }
      }

      const cleanGST = gstNumber.replace(/\s/g, "").toUpperCase()

      if (cleanGST.length !== 15) {
        return { error: "GST Number must be exactly 15 characters long" }
      }

      if (!isValidGSTNumber(gstNumber)) {
        return {
          error: "Invalid GST Number format. Please enter a valid 15-character GST number (e.g., 22AAAAA0000A1Z5)",
        }
      }

      // Check if GST number already exists
      const existingGST = await UserModel.findOne({ gstNumber: cleanGST })
      if (existingGST) {
        return { error: "This GST Number is already registered with another account" }
      }
    }

    // Handle password - if provided use it, otherwise generate random
    let hashedPassword: string
    if (passwordInput && passwordInput.trim()) {
      // User provided a password - validate it
      if (passwordInput.length < 8) {
        return { error: "Password must be at least 8 characters long" }
      }
      const hasLetter = /[a-zA-Z]/.test(passwordInput)
      const hasNumber = /[0-9]/.test(passwordInput)
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordInput)

      if (!hasLetter || !hasNumber || !hasSpecial) {
        return { error: "Password must contain letters, numbers, and special characters" }
      }
      hashedPassword = await bcrypt.hash(passwordInput, 10)
    } else {
      // Generate a random password for OTP-only signup
      const randomPassword = Math.random().toString(36).slice(-12)
      hashedPassword = await bcrypt.hash(randomPassword, 10)
    }

    const userData: any = {
      name,
      email,
      phone,
      password: hashedPassword,
      type: userType,
      emailVerified: true, // Mark as verified since OTP was used
    }

    // Add GST number if provided (clean and uppercase)
    if (gstNumber) {
      userData.gstNumber = gstNumber.replace(/\s/g, "").toUpperCase()
    }

    const user = await UserModel.create(userData)

    // Delete the OTP record after successful signup
    await deleteOTP(email, "signup")

// Send welcome email asynchronously (non-blocking) - doesn't affect signup success
    sendWelcomeEmail(email, name).catch((error) => {
      console.error("[SignUp] Error sending welcome email:", error)
      // Don't throw error - signup already succeeded
    })


    return {
      success: true,
      message: "Registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in signUp:", error)
    return { error: "Something went wrong" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
  redirect("/")
}

export async function getCurrentUser() {
  try {
    const UserModel = await getUserModel()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")

    if (!token || !token.value) return null

    const decoded = jwt.verify(token.value, JWT_SECRET) as {
      userId: string
      type: string
    }

    const user = (await UserModel.findById(decoded.userId).select("-password").lean()) as
      | (Omit<IUser, "password"> & { _id: any })
      | null

    if (!user) return null

    const plainUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      type: user.type,
      onboardingStatus: user.onboardingStatus || "pending",
      lightOnboardingData: user.lightOnboardingData
        ? {
            businessName: user.lightOnboardingData.businessName || "",
            gstNumber: user.lightOnboardingData.gstNumber || "",
            address: user.lightOnboardingData.address || "",
            categories: user.lightOnboardingData.categories || [],
          }
        : undefined,
    }

    return plainUser
  } catch (error) {
    // During build time, cookies() throws an error - return null gracefully
    if (error instanceof Error && error.message.includes("Dynamic server usage")) {
      return null
    }
    return null
  }
}

export async function updateUserType(userId: string, newType: "admin" | "seller" | "customer") {
  try {
    const UserModel = await getUserModel()

    const user = await UserModel.findByIdAndUpdate(userId, { type: newType }, { new: true }).select("-password")

    if (!user) {
      return { error: "User not found" }
    }

    return {
      success: true,
      message: "User type updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in updateUserType:", error)
    return { error: "Something went wrong" }
  }
}

/**
 * Sign in using OTP - Only for verified email via OTP
 */
export async function signInWithOTP(email: string, requiredRole?: string) {
  try {
    const UserModel = await getUserModel()

    // Verify OTP was checked
    const isOTPVerifiedStatus = await isOTPVerified(email.toLowerCase(), "login")
    if (!isOTPVerifiedStatus) {
      return { error: "Please verify your email with OTP first" }
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() })
    if (!user) {
      return { error: "User not found" }
    }

    // If a specific role is required, check if user has that role
    if (requiredRole && user.type !== requiredRole) {
      return { 
        error: `Access denied. Only ${requiredRole} users can access this portal.`,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          type: user.type,
        }
      }
    }

    const token = jwt.sign({ userId: user._id, type: user.type }, JWT_SECRET, { expiresIn: "1d" })

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 1, // 1 day
    })

    // Delete the OTP record after successful login
    await deleteOTP(email.toLowerCase(), "login")

    return {
      success: true,
      message: "Signed in successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        type: user.type,
      },
    }
  } catch (error) {
    console.error("Error in signInWithOTP:", error)
    return { error: "Something went wrong" }
  }
}
