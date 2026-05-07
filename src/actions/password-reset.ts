"use server"

import { getUserModel } from "@/models/user"
import { OTPVerification } from "@/models/otp-verification"
import bcrypt from "bcryptjs"
import { connectToProfileDB } from "@/lib/mongodb"

export async function verifyEmailForReset(email: string) {
  try {
    await connectToProfileDB()
    const UserModel = await getUserModel()
    const user = await UserModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return { error: "Email not found in our records" }
    }

    return {
      success: true,
      message: "Email verified successfully",
    }
  } catch (error) {
    console.error("Error in verifyEmailForReset:", error)
    return { error: "Something went wrong" }
  }
}

export async function resetPassword(email: string, newPassword: string) {
  try {
    await connectToProfileDB()
    const UserModel = await getUserModel()

    // Verify OTP was verified first
    const otpRecord = await OTPVerification.findOne({
      email: email.toLowerCase(),
      type: "password-reset",
      isVerified: true,
    })

    if (!otpRecord) {
      return { error: "Please verify your email with OTP first" }
    }

    if (newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long" }
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)

    if (!hasLetter || !hasNumber || !hasSpecial) {
      return { error: "Password must contain letters, numbers, and special characters" }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    const user = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    )

    if (!user) {
      return { error: "User not found" }
    }

    // Delete OTP record after successful reset
    await OTPVerification.deleteOne({ _id: otpRecord._id })

    return {
      success: true,
      message: "Password reset successfully",
    }
  } catch (error) {
    console.error("Error in resetPassword:", error)
    return { error: "Something went wrong" }
  }
}
