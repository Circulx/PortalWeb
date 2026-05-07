import nodemailer from "nodemailer"


const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || "noreply@ind2b.com"
  const emailPassword = process.env.EMAIL_APP_PASSWORD || ""

  if (!emailPassword) {
    console.warn("[Email] EMAIL_APP_PASSWORD not configured. Emails will fail to send.")
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  })
}

const FROM_EMAIL = process.env.EMAIL_USER || "noreply@ind2b.com"

export async function sendEmail({
  to,
  subject,
  html,
  from = FROM_EMAIL,
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    const transporter = createTransporter()

    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
    })

    console.log("[Email] Message sent:", info.messageId)
    return { success: true, data: { messageId: info.messageId } }
  } catch (error) {
    console.error("[Email] Error sending email:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send email"
    }
  }
}
