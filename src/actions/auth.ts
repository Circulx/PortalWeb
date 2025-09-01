"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserModel } from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { isValidGSTINChecksum, verifyGSTINWithProvider } from "@/lib/gst"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

// GST Number validation function
function isValidGSTNumber(gstNumber: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanGST = gstNumber.replace(/\s/g, "").toUpperCase()

  // GST format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit (entity number) + 1 alphabet (Z) + 1 alphanumeric (checksum)
  // Total 15 characters
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/

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
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const userType = (formData.get("userType") as string) || "customer"
    const gstNumber = (formData.get("gstNumber") as string) || ""

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return { error: "Email already exists" }
    }

    // Validate GST number for sellers
    if (userType === "seller") {
      if (!gstNumber) {
        return { error: "GST Number is required for sellers" }
      }

      // Format + checksum validation
      if (!isValidGSTNumber(gstNumber) || !isValidGSTINChecksum(gstNumber)) {
        return { error: "Please enter a valid GST number (format/checksum failed)" }
      }

      // Provider verification (server-side enforcement)
      const verifyResult = await verifyGSTINWithProvider(gstNumber)
      if (verifyResult.status === "MISSING_PROVIDER_KEY") {
        return { error: "GST verification service not configured. Please contact support." }
      }
      if (!verifyResult.valid) {
        return {
          error: verifyResult.message || "GST number could not be verified. Please check and try again.",
        }
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

    const user = await UserModel.findById(decoded.userId).select("-password")

    if (!user) return null

    const plainUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      type: user.type,
    }

    return plainUser
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
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
