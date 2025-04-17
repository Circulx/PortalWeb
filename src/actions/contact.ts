"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const IS_PRODUCTION = process.env.NODE_ENV === "production"
const FROM_EMAIL = IS_PRODUCTION
  ? "Your Company <contact@yourdomain.com>" // Replace with your verified domain
  : "Acme <onboarding@resend.dev>"
const TO_EMAIL = IS_PRODUCTION ? "Ranjeshroy97099@gmail.com" : "21cs3039@rgipt.ac.in" // Your Resend account email

export async function sendContactEmail(formData: FormData) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const description = formData.get("description") as string
    const orderId = formData.get("orderId") as string
    const queryType = formData.get("queryType") as string

    if (!name || !email || !description) {
      return { success: false, error: "Required fields are missing" }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email, // Changed from 'reply_to' to 'replyTo'
      subject: `IND2B Contact Submisssion - ${queryType || "General Query"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF5C00;">New Contact Form Submission</h2>
          <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Query Type:</strong> ${queryType || "Not specified"}</p>
            <p><strong>Order ID:</strong> ${orderId || "Not provided"}</p>
            <p><strong>Description:</strong></p>
            <p style="white-space: pre-wrap;">${description}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend API error:", error)
      return { success: false, error: "Failed to send email" }
    }

    console.log("Email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

