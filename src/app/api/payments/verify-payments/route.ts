import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification parameters" },
        { status: 400 },
      )
    }

    // Create a signature using the order_id and payment_id
    const key_secret = process.env.RAZORPAY_KEY_SECRET || ""
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac("sha256", key_secret).update(payload).digest("hex")

    // Compare the signatures
    const isSignatureValid = expectedSignature === razorpay_signature

    if (isSignatureValid) {
      // Payment is verified successfully
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      })
    } else {
      // Payment verification failed
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed. Invalid signature.",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify payment",
      },
      { status: 500 },
    )
  }
}
