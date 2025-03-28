import { NextResponse } from "next/server"
import { PaymentModel } from "./payments"

export async function GET() {
  try {
    const payments = await PaymentModel.find().lean()
    return NextResponse.json(payments, { status: 200 })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error fetching payments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const paymentData = await request.json()
    const newPayment = new PaymentModel({
      ...paymentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    await newPayment.save()
    return NextResponse.json(newPayment, { status: 201 })
  } catch (error) {
    console.error("Error posting payment:", error)
    return NextResponse.json({ error: "Error posting payment" }, { status: 500 })
  }
}

