import { sendEmail } from "@/lib/email"
import { generateWelcomeEmail } from "@/lib/email-templates"

/**
 * Send welcome email to newly registered user
 * This function is non-blocking and won't affect signup success
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

    const result = await sendEmail({
      to: email,
      subject: "Welcome to IND2B - Start Shopping Today!",
      html: htmlContent,
    })

    if (result.success) {
      console.log("[Welcome Email] Successfully sent welcome email to:", email)
      return {
        success: true,
        message: "Welcome email sent successfully",
        messageId: result.data?.messageId,
      }
    } else {
      console.warn("[Welcome Email] Failed to send welcome email to:", email, "Error:", result.error)
      return {
        success: false,
        message: "Failed to send welcome email",
      }
    }
  } catch (error) {
    console.error("[Welcome Email] Error sending welcome email:", error)
    return {
      success: false,
      message: "Error sending welcome email",
    }
  }
}
