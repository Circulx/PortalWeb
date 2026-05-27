import { sendEmail } from "@/lib/email"
import { generateWelcomeEmail } from "@/lib/email-templates"

/**
 * Send welcome email to newly registered user
 * This function is non-blocking and won't affect signup success
 * Has a 5-second timeout to prevent blocking the signup response
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{
  success: boolean
  message: string
  messageId?: string
}> {
  try {
    const htmlContent = generateWelcomeEmail({
      name,
      email,
    })

    // Wrap in Promise.race with a 5-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Welcome email timeout")), 5000)
    )

    const result = await Promise.race([
      sendEmail({
        to: email,
        subject: "Welcome to IND2B - Start Shopping Today!",
        html: htmlContent,
      }),
      timeoutPromise as any,
    ])

    if (result && result.success) {
      console.log("[Welcome Email] Successfully sent welcome email to:", email)
      return {
        success: true,
        message: "Welcome email sent successfully",
        messageId: result.data?.messageId,
      }
    } else {
      console.warn("[Welcome Email] Failed to send welcome email to:", email, "Error:", result?.error)
      return {
        success: false,
        message: "Failed to send welcome email",
      }
    }
  } catch (error) {
    console.warn("[Welcome Email] Error or timeout sending welcome email:", error instanceof Error ? error.message : error)
    // Return success anyway - don't fail signup due to email timeout
    return {
      success: true, // Return success to not block signup
      message: "Account created (email will be sent shortly)",
    }
  }
}