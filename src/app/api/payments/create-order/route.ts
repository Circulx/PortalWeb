import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { amount, currency = "INR", receipt, notes } = body

    // Validate required fields
    if (!amount) {
      return NextResponse.json({ success: false, error: "Amount is required" }, { status: 400 })
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    // For INR, 1 rupee = 100 paise
    const amountInPaise = Math.round(amount * 100)

    // Initialize Razorpay instance with API keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    })

    // Create a new order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: receipt,
      notes: notes,
    })

    // Return the order details
    return NextResponse.json({
      success: true,
      id: order.id,
      amount: amountInPaise,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Error creating Razorpay order:", error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    )
  }
}
