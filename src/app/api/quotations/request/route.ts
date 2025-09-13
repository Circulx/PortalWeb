import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import getQuotationRequestModel from "@/models/profile/quotation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productTitle, sellerId, customerName, customerEmail, customerPhone, requestedPrice, message } =
      body

    // Validate required fields
    if (
      !productId ||
      !productTitle ||
      !sellerId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !requestedPrice
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number (basic validation)
    if (customerPhone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }

    // Validate price
    if (requestedPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const QuotationRequest = getQuotationRequestModel(connection)

    // Create new quotation request
    const quotationRequest = new QuotationRequest({
      productId,
      productTitle,
      sellerId,
      customerName,
      customerEmail,
      customerPhone,
      requestedPrice,
      message: message || "",
      status: "pending",
    })

    await quotationRequest.save()

    return NextResponse.json({
      success: true,
      message: "Quotation request sent successfully",
      data: {
        id: quotationRequest._id,
        status: quotationRequest.status,
      },
    })
  } catch (error) {
    console.error("Error creating quotation request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
