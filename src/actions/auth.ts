"use server"
import { redirect } from "next/navigation"
import { getUserModel } from "@/models/user"
import bcrypt from "bcryptjs"
import { createUserSession, getUserSession, clearUserSession } from "@/lib/session-store"

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

    const user = await UserModel.findOne({ email })
    if (!user) {
      return { error: "User not found" }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return { error: "Invalid credentials" }
    }

    const session = await createUserSession(user)

    if (!session) {
      return { error: "Failed to create session" }
    }

    console.log("[v0] User signed in successfully:", email)

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
    console.error("[v0] Error in signIn:", error)
    return { error: "Something went wrong" }
  }
}

export async function signUp(formData: FormData) {
  try {
    const UserModel = await getUserModel()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const userType = (formData.get("userType") as string) || "customer"
    const gstNumber = formData.get("gstNumber") as string

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" }
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long" }
    }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

    if (!hasLetter || !hasNumber || !hasSpecial) {
      return { error: "Password must contain letters, numbers, and special characters" }
    }

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return { error: "Email already exists" }
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

    const hashedPassword = await bcrypt.hash(password, 10)

    const userData: any = {
      name,
      email,
      password: hashedPassword,
      type: userType,
    }

    // Add GST number if provided (clean and uppercase)
    if (gstNumber) {
      userData.gstNumber = gstNumber.replace(/\s/g, "").toUpperCase()
    }

    const user = await UserModel.create(userData)

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
  await clearUserSession()
  redirect("/")
}

export async function verifyClientToken(token: string) {
  console.log("[v0] verifyClientToken called - checking session instead")
  // Just return the current session
  return await getUserSession()
}

export async function getCurrentUser() {
  try {
    const user = await getUserSession()

    if (user) {
      console.log("[v0] Current user retrieved:", user.email, "Type:", user.type)
    } else {
      console.log("[v0] No current user found")
    }

    return user
  } catch (error) {
    console.error("[v0] Error in getCurrentUser:", error)
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
