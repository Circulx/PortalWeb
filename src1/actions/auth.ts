"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserModel } from "@/models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb"

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

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      return { error: "Email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      type: "customer", // Default type
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
