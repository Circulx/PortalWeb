"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserModel } from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

function isValidGSTNumber(gstNumber: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanGST = gstNumber.replace(/\s/g, "").toUpperCase()

  // Check length
  if (cleanGST.length !== 15) {
    return false
  }

  // GST format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit (entity number) + 1 alphabet (Z) + 1 alphanumeric (checksum)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/

  if (!gstRegex.test(cleanGST)) {
    return false
  }

  // Additional validations
  const stateCode = cleanGST.substring(0, 2)
  const panPart = cleanGST.substring(2, 12)
  const entityCode = cleanGST.substring(12, 13)
  const checkDigit = cleanGST.substring(13, 14)
  const defaultZ = cleanGST.substring(14, 15)

  // Validate state code (01-37 are valid state codes in India)
  const stateCodeNum = Number.parseInt(stateCode)
  if (stateCodeNum < 1 || stateCodeNum > 37) {
    return false
  }

  // Validate PAN format within GST (5 letters + 4 digits + 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panRegex.test(panPart)) {
    return false
  }

  // Entity code should be 1-9 or A-Z (but not 0)
  if (entityCode === "0") {
    return false
  }

  // 14th character should be Z (default)
  if (defaultZ !== "Z") {
    return false
  }

  // Basic checksum validation (simplified)
  const checksumChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (!checksumChars.includes(checkDigit)) {
    return false
  }

  return true
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
    const gstNumber = formData.get("gstNumber") as string

    // Validate name format
    const nameRegex = /^[a-zA-Z\s.'-]+$/
    if (!nameRegex.test(name)) {
      return { error: "Full name can only contain letters, spaces, periods, apostrophes, and hyphens" }
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email format" }
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
