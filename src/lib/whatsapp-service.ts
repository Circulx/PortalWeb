// WhatsApp notification service using Twilio WhatsApp Business API
import twilio from "twilio"

interface OrderDetails {
  orderId: string
  customerName: string
  customerPhone: string
  products: Array<{
    title: string
    quantity: number
    price: number
  }>
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
}

export class WhatsAppService {
  private client: twilio.Twilio
  private fromNumber: string

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886" // Twilio Sandbox number

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials are required for WhatsApp service")
    }

    this.client = twilio(accountSid, authToken)
  }

  // Format order details into WhatsApp message
  private formatOrderMessage(orderDetails: OrderDetails): string {
    const { orderId, customerName, products, totalAmount, paymentMethod, status, createdAt } = orderDetails

    let message = `🎉 *Order Confirmation*\n\n`
    message += `Hello ${customerName}! 👋\n\n`
    message += `Your order has been successfully placed!\n\n`
    message += `📋 *Order Details:*\n`
    message += `Order ID: #${orderId}\n`
    message += `Date: ${new Date(createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}\n`
    message += `Status: ${status.toUpperCase()}\n\n`

    message += `🛍️ *Items Ordered:*\n`
    products.forEach((product, index) => {
      message += `${index + 1}. ${product.title}\n`
      message += `   Qty: ${product.quantity} × ₹${product.price.toFixed(2)}\n`
      message += `   Subtotal: ₹${(product.quantity * product.price).toFixed(2)}\n\n`
    })

    message += `💰 *Payment Summary:*\n`
    message += `Total Amount: ₹${totalAmount.toFixed(2)}\n`
    message += `Payment Method: ${paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}\n\n`

    message += `📦 *What's Next?*\n`
    message += `• We'll process your order within 24 hours\n`
    message += `• You'll receive tracking details once shipped\n`
    message += `• Expected delivery: 3-5 business days\n\n`

    message += `Need help? Contact us:\n`
    message += `📞 Customer Support: +91-XXXXXXXXXX\n`
    message += `📧 Email: support@ind2b.com\n\n`

    message += `Thank you for shopping with IND2B! 🙏`

    return message
  }

  // Send WhatsApp notification
  async sendOrderNotification(orderDetails: OrderDetails): Promise<boolean> {
    try {
      // Format phone number for WhatsApp (ensure it starts with country code)
      let phoneNumber = orderDetails.customerPhone.replace(/\D/g, "") // Remove non-digits

      // Add country code if not present (assuming India +91)
      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber
      }

      const toNumber = `whatsapp:+${phoneNumber}`
      const message = this.formatOrderMessage(orderDetails)

      console.log(`[WhatsApp] Sending notification to ${toNumber}`)
      console.log(`[WhatsApp] Message preview:`, message.substring(0, 200) + "...")

      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: toNumber,
        body: message,
      })

      console.log(`[WhatsApp] Message sent successfully. SID: ${result.sid}`)
      return true
    } catch (error) {
      console.error("[WhatsApp] Failed to send notification:", error)

      // Log specific error details for debugging
      if (error instanceof Error) {
        console.error("[WhatsApp] Error message:", error.message)
      }

      return false
    }
  }

  // Test WhatsApp service connection
  async testConnection(): Promise<boolean> {
    try {
      // Send a simple test message to verify service is working
      const testMessage = await this.client.messages.create({
        from: this.fromNumber,
        to: "whatsapp:+919999999999", // Test number
        body: "WhatsApp service test - please ignore",
      })

      console.log(`[WhatsApp] Test message sent. SID: ${testMessage.sid}`)
      return true
    } catch (error) {
      console.error("[WhatsApp] Service test failed:", error)
      return false
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()
