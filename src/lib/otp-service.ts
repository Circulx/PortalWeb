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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

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
      expiresIn: 10,
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

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
      expiresIn: 10,
    })

    await sendEmail({
      to: email,
      subject: "Your IND2B Login OTP",
      html: htmlContent,
    })

    return {
      success: true,
      message: "OTP sent successfully",
      expiresIn: 10 * 60, // 10 minutes in seconds
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ind2b.com"
  const year = new Date().getFullYear()
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - IND2B</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="max-width:500px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.10);">

              <!-- Logo header -->
              <tr>
                <td align="center" style="padding:20px 24px 16px;background:#ffffff;border-bottom:1px solid #e2e8f0;">
                  <a href="${appUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
                    <img src="${appUrl}/logo1.webp" alt="IND2B" width="40" height="40"
                      style="display:inline-block;border-radius:8px;vertical-align:middle;" />
                    <span style="font-size:20px;font-weight:800;color:#ef4444;vertical-align:middle;letter-spacing:-0.5px;">IND2B</span>
                  </a>
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td style="padding:36px 24px 28px;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:60px;height:60px;line-height:60px;text-align:center;font-size:28px;margin-bottom:14px;">🔐</div>
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Password Reset</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.88);font-size:14px;">Your IND2B account security</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 32px 0;">
                  <p style="margin:0;font-size:15px;color:#475569;line-height:1.7;">
                    We received a request to reset your password for <strong style="color:#1e293b;">${data.email}</strong>.
                    Use the code below to proceed. Do not share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td style="padding:28px 32px 0;text-align:center;">
                  <div style="background:linear-gradient(135deg,#fef2f2,#fee2e2);border:2px dashed #ef4444;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Your Reset Code</p>
                    <div style="letter-spacing:12px;font-size:38px;font-weight:800;color:#dc2626;font-family:monospace;">${data.otp}</div>
                    <p style="margin:10px 0 0;font-size:13px;color:#94a3b8;">Expires in <strong style="color:#ef4444;">${data.expiresIn} minutes</strong></p>
                  </div>
                </td>
              </tr>

              <!-- Warning -->
              <tr>
                <td style="padding:24px 32px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;">
                    <tr>
                      <td style="padding:14px 16px;">
                        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                          <strong>⚠️ Didn't request this?</strong> Ignore this email — your password remains unchanged. If you're concerned, contact us at
                          <a href="mailto:support@ind2b.com" style="color:#b45309;">support@ind2b.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:28px 32px;text-align:center;border-top:1px solid #e2e8f0;margin-top:28px;">
                  <p style="margin:0;font-size:13px;color:#94a3b8;">© ${year} IND2B. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}