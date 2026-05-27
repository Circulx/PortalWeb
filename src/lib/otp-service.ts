import { OTPVerification } from "@/models/otp-verification"
import { sendEmail } from "@/lib/email"
import {
  generateSignupOTPEmail,
  generateLoginOTPEmail,
} from "@/lib/email-templates"
import { connectToProfileDB } from "@/lib/mongodb"

/**
 * Get OTP model from the profile database connection
 */
async function getOTPModel() {
  const connection = await connectToProfileDB()
  return connection.model("OTPVerification")
}

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP to email for signup
 */
export async function sendSignupOTP(email: string): Promise<{
  success: boolean
  message: string
  expiresIn?: number
}> {
  try {
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes

    // Get OTP model from the profile DB connection
    const OTPModel = await getOTPModel()
    
    // Insert OTP directly using the collection from the proper connection
    await OTPModel.collection.insertOne({
      email: email.toLowerCase(),
      otp,
      type: "signup",
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send email
    const htmlContent = generateSignupOTPEmail({
      otp,
      email,
      expiresIn: 2,
    })

    await sendEmail({
      to: email,
      subject: "Verify Your Email - IND2B Signup OTP",
      html: htmlContent,
    })

    return {
      success: true,
      message: "OTP sent successfully",
      expiresIn: 10 * 60, // 10 minutes in seconds
    }
  } catch (error) {
    console.error("[OTP Service] Error sending signup OTP:", error)
    return {
      success: false,
      message: "Failed to send OTP",
    }
  }
}

/**
 * Send OTP to email for login
 */
export async function sendLoginOTP(email: string): Promise<{
  success: boolean
  message: string
  expiresIn?: number
}> {
  try {
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes

    // Get OTP model from the profile DB connection
    const OTPModel = await getOTPModel()
    
    // Insert OTP directly using the collection from the proper connection
    await OTPModel.collection.insertOne({
      email: email.toLowerCase(),
      otp,
      type: "login",
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send email
    const htmlContent = generateLoginOTPEmail({
      otp,
      email,
      expiresIn: 2,
    })

    await sendEmail({
      to: email,
      subject: "Your IND2B Login OTP",
      html: htmlContent,
    })

    return {
      success: true,
      message: "OTP sent successfully",
      expiresIn: 2 * 60, // 2 minutes in seconds
    }
  } catch (error) {
    console.error("[OTP Service] Error sending login OTP:", error)
    return {
      success: false,
      message: "Failed to send OTP",
    }
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  email: string,
  otp: string,
  type: "signup" | "login" | "password-reset"
): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Get OTP model from the profile DB connection
    const OTPModel = await getOTPModel()

    const otpRecord = await OTPModel.findOne({
      email,
      type,
    })

    if (!otpRecord) {
      return {
        success: false,
        message: "No OTP found for this email",
      }
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTPModel.deleteOne({ _id: otpRecord._id })
      return {
        success: false,
        message: "OTP has expired",
      }
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      }
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1
      await otpRecord.save()

      return {
        success: false,
        message: `Invalid OTP. ${otpRecord.maxAttempts - otpRecord.attempts} attempts remaining.`,
      }
    }

    // Mark as verified
    otpRecord.isVerified = true
    await otpRecord.save()

    return {
      success: true,
      message: "OTP verified successfully",
    }
  } catch (error) {
    console.error("[OTP Service] Error verifying OTP:", error)
    return {
      success: false,
      message: "Error verifying OTP",
    }
  }
}

/**
 * Check if OTP is verified for email
 */
export async function isOTPVerified(
  email: string,
  type: "signup" | "login" | "password-reset"
): Promise<boolean> {
  try {
    // Get OTP model from the profile DB connection
    const OTPModel = await getOTPModel()

    const otpRecord = await OTPModel.findOne({
      email,
      type,
      isVerified: true,
    })

    return !!otpRecord
  } catch (error) {
    console.error("[OTP Service] Error checking OTP verification:", error)
    return false
  }
}

/**
 * Delete OTP record after successful signup/login
 */
export async function deleteOTP(
  email: string,
  type: "signup" | "login" | "password-reset"
): Promise<void> {
  try {
    // Get OTP model from the profile DB connection
    const OTPModel = await getOTPModel()

    await OTPModel.deleteOne({
      email,
      type,
    })
  } catch (error) {
    console.error("[OTP Service] Error deleting OTP:", error)
  }
}

/**
 * Resend OTP (creates new OTP and sends it)
 */
export async function resendOTP(
  email: string,
  type: "signup" | "login" | "password-reset"
): Promise<{
  success: boolean
  message: string
  expiresIn?: number
}> {
  try {
    // Send new OTP based on type
    if (type === "signup") {
      return await sendSignupOTP(email)
    } else if (type === "login") {
      return await sendLoginOTP(email)
    } else if (type === "password-reset") {
      return await sendPasswordResetOTP(email)
    }
    
    return {
      success: false,
      message: "Invalid OTP type",
    }
  } catch (error) {
    console.error("[OTP Service] Error resending OTP:", error)
    return {
      success: false,
      message: "Failed to resend OTP",
    }
  }
}

/**
 * Send OTP to email for password reset
 */
export async function sendPasswordResetOTP(email: string): Promise<{
  success: boolean
  message: string
  expiresIn?: number
}> {
  try {
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Get OTP model from the profile DB connection
    const OTPModel = await getOTPModel()
    
    // Insert OTP directly using the collection from the proper connection
    await OTPModel.collection.insertOne({
      email: email.toLowerCase(),
      otp,
      type: "password-reset",
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send email
    const htmlContent = generatePasswordResetOTPEmail({
      otp,
      email,
      expiresIn: 10,
    })

    await sendEmail({
      to: email,
      subject: "Password Reset OTP - IND2B",
      html: htmlContent,
    })

    return {
      success: true,
      message: "OTP sent successfully",
      expiresIn: 10 * 60, // 10 minutes in seconds
    }
  } catch (error) {
    console.error("[OTP Service] Error sending password reset OTP:", error)
    return {
      success: false,
      message: "Failed to send OTP",
    }
  }
}

/**
 * Generate password reset OTP email template
 */
function generatePasswordResetOTPEmail(data: { otp: string; email: string; expiresIn: number }): string {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #666; margin-bottom: 15px;">We received a request to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #004D41; color: #ffffff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; font-size: 32px;">${data.otp}</h1>
        </div>
        <p style="color: #999; font-size: 14px; margin-bottom: 15px;">This OTP will expire in ${data.expiresIn} minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© 2024 IND2B. All rights reserved.</p>
      </div>
    </div>
  `
}