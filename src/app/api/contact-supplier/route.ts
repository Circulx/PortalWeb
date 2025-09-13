import { NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"
import { sendEmail } from "@/lib/email"
import { whatsappService } from "@/lib/whatsapp-service"

// Contact inquiry schema
const contactInquirySchema = new mongoose.Schema({
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  message: { type: String, required: true },
  product: {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    seller_name: { type: String },
    location: { type: String },
    seller_id: { type: String }, // Add seller ID for lookup
  },
  status: { 
    type: String, 
    enum: ["pending", "contacted", "resolved"], 
    default: "pending" 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Helper function to get seller contact information
async function getSellerContactInfo(connection: mongoose.Connection, sellerId: string) {
  try {
    // Define Contact schema if it doesn't exist
    if (!connection.models.Contact) {
      const ContactSchema = new mongoose.Schema({
        userId: { type: String, required: true, index: true },
        contactName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        emailId: { type: String, required: true },
        pickupTime: { type: String, required: true },
      }, { timestamps: true })
      connection.model("Contact", ContactSchema)
    }

    const Contact = connection.models.Contact
    const contactDetails = await Contact.findOne({ userId: sellerId }).lean() as any
    
    return contactDetails ? {
      email: contactDetails.emailId,
      phone: contactDetails.phoneNumber,
      name: contactDetails.contactName
    } : null
  } catch (error) {
    console.error("Error fetching seller contact info:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  let connection
  try {
    connection = await connectProfileDB()
    
    const ContactInquiry = connection.models.ContactInquiry || 
      connection.model("ContactInquiry", contactInquirySchema)

    const body = await request.json()
    const { name, email, phone, message, product } = body

    // Validate required fields
    if (!name || !email || !phone || !message || !product) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get seller ID from product (assuming it's available in the product data)
    // If not available, we'll need to find it by seller_name
    let sellerId = product.seller_id
    
    if (!sellerId && product.seller_name) {
      // Try to find seller by name in the Product collection
      const Product = connection.models.Product || connection.model("Product", new mongoose.Schema({}, { strict: false }))
      const sellerProduct = await Product.findOne({ seller_name: product.seller_name }).lean() as any
      sellerId = sellerProduct?.seller_id || sellerProduct?.sellerId
    }

    // Create new contact inquiry
    const inquiry = new ContactInquiry({
      buyerName: name,
      buyerEmail: email,
      buyerPhone: phone,
      message: message,
      product: {
        id: product.id,
        title: product.title,
        sku: product.sku,
        price: product.price,
        seller_name: product.seller_name,
        location: product.location,
        seller_id: sellerId,
      },
    })

    await inquiry.save()

    // Get seller contact information
    let sellerContact = null
    if (sellerId) {
      sellerContact = await getSellerContactInfo(connection, sellerId)
    }

    // Send notifications to seller
    if (sellerContact?.email) {
      try {
        const emailSubject = `New Product Inquiry - ${product.title}`
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Product Inquiry Received</h2>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Product Details</h3>
              <p><strong>Product:</strong> ${product.title}</p>
              <p><strong>SKU:</strong> ${product.sku}</p>
              <p><strong>Price:</strong> ₹${product.price.toLocaleString()}</p>
              <p><strong>Location:</strong> ${product.location || 'Not specified'}</p>
            </div>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin-top: 0;">Buyer Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">Inquiry Message</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46; margin-top: 0;">Next Steps</h3>
              <p>Please contact the buyer within 24 hours to maintain your response rate.</p>
              <p>You can reach them at:</p>
              <ul>
                <li>Email: <a href="mailto:${email}">${email}</a></li>
                <li>Phone: <a href="tel:${phone}">${phone}</a></li>
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This inquiry was sent through IND2B platform. Please respond promptly to maintain your seller rating.
            </p>
          </div>
        `

        await sendEmail({
          to: sellerContact.email,
          subject: emailSubject,
          html: emailHtml,
        })

        console.log("Email notification sent to seller:", sellerContact.email)
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError)
      }
    }

    // Send WhatsApp notification to seller
    if (sellerContact?.phone) {
      try {
        const whatsappMessage = `🎯 *NEW PRODUCT INQUIRY RECEIVED*

📦 *Product:* ${product.title}
🏷️ *SKU:* ${product.sku}
💰 *Price:* ₹${product.price.toLocaleString()}
📍 *Location:* ${product.location || 'Not specified'}

👤 *Buyer Details:*
• Name: ${name}
• Email: ${email}
• Phone: ${phone}

💬 *Inquiry:*
${message}

⏰ *Action Required:*
Please contact the buyer within 24 hours to maintain your response rate.

📞 *Contact Buyer:*
• Email: ${email}
• Phone: ${phone}

Thank you for using IND2B! 🚀`

        await whatsappService.sendMarketingMessage({
          phone: sellerContact.phone,
          name: sellerContact.name || product.seller_name || "Seller",
          message: whatsappMessage,
          campaignType: "update"
        })

        console.log("WhatsApp notification sent to seller:", sellerContact.phone)
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp notification:", whatsappError)
      }
    }

    // Send confirmation email to buyer
    try {
      const buyerEmailSubject = `Inquiry Sent Successfully - ${product.title}`
      const buyerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Inquiry Sent Successfully!</h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for your interest in our product. Your inquiry has been sent to the supplier and they will contact you within 24 hours.</p>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Your Inquiry Details</h3>
            <p><strong>Product:</strong> ${product.title}</p>
            <p><strong>SKU:</strong> ${product.sku}</p>
            <p><strong>Price:</strong> ₹${product.price.toLocaleString()}</p>
            <p><strong>Supplier:</strong> ${product.seller_name || 'Not specified'}</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">What's Next?</h3>
            <ul>
              <li>The supplier will contact you within 24 hours</li>
              <li>They may call, email, or WhatsApp you</li>
              <li>You can discuss pricing, availability, and delivery</li>
              <li>Feel free to ask any questions about the product</li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you don't hear from the supplier within 24 hours, please contact our support team.
          </p>

          <p>Best regards,<br>IND2B Team</p>
        </div>
      `

      await sendEmail({
        to: email,
        subject: buyerEmailSubject,
        html: buyerEmailHtml,
      })

      console.log("Confirmation email sent to buyer:", email)
    } catch (buyerEmailError) {
      console.error("Failed to send confirmation email to buyer:", buyerEmailError)
    }

    console.log("Contact inquiry saved and notifications sent:", {
      buyer: name,
      email: email,
      product: product.title,
      seller: product.seller_name,
      sellerContact: sellerContact ? "Found" : "Not found",
    })

    return NextResponse.json({
      success: true,
      message: "Inquiry sent successfully",
      inquiryId: inquiry._id,
    })

  } catch (error) {
    console.error("Error saving contact inquiry:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send inquiry" },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.close()
    }
  }
}

export async function GET(request: NextRequest) {
  let connection
  try {
    connection = await connectProfileDB()
    
    const ContactInquiry = connection.models.ContactInquiry || 
      connection.model("ContactInquiry", contactInquirySchema)

    const { searchParams } = new URL(request.url)
    const sellerName = searchParams.get("seller")

    let query = {}
    if (sellerName) {
      query = { "product.seller_name": sellerName }
    }

    const inquiries = await ContactInquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({
      success: true,
      inquiries: inquiries,
    })

  } catch (error) {
    console.error("Error fetching contact inquiries:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiries" },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.close()
    }
  }
}
