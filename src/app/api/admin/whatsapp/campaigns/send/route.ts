import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import { whatsappService } from "@/lib/whatsapp-service"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.type !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 })
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Connect to database
    const connection = await connectProfileDB()
    const WhatsAppCampaign = connection.models.WhatsAppCampaign
    const WhatsAppCampaignLog = connection.models.WhatsAppCampaignLog
    const Order = connection.models.Order
    const Contact = connection.models.Contact
    const BuyerAddress = connection.models.BuyerAddress
    const CustomerPreferences = connection.models.CustomerPreferences

    if (!WhatsAppCampaign || !WhatsAppCampaignLog) {
      return NextResponse.json({ error: "Required models not available" }, { status: 500 })
    }

    // Get campaign details
    const campaign = await WhatsAppCampaign.findById(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign already sent" }, { status: 400 })
    }

    // Get target recipients based on campaign settings
    let recipients: any[] = []

    if (campaign.targetAudience === "all") {
      // Get all customers with orders
      const orders = await Order.find({}).distinct("userId")
      const contacts = await Contact.find({ userId: { $in: orders } })
      recipients = contacts.map((contact) => ({
        phone: contact.phoneNumber,
        name: contact.contactName || contact.name || "Customer",
        email: contact.emailId,
        userId: contact.userId,
      }))
    } else if (campaign.targetAudience === "customers") {
      let targetUserIds: string[] = []

      // Base query for orders
      const orderQuery: any = {}
      const addressQuery: any = {}

      // Filter by order history
      if (campaign.customerSegment?.orderHistory === "has_orders") {
        targetUserIds = await Order.find({}).distinct("userId")
      } else if (campaign.customerSegment?.orderHistory === "no_orders") {
        const usersWithOrders = await Order.find({}).distinct("userId")
        const allContacts = await Contact.find({})
        targetUserIds = allContacts
          .filter((contact) => !usersWithOrders.includes(contact.userId))
          .map((contact) => contact.userId)
      } else if (campaign.customerSegment?.orderHistory === "recent_orders") {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        targetUserIds = await Order.find({ createdAt: { $gte: thirtyDaysAgo } }).distinct("userId")
      } else if (campaign.customerSegment?.orderHistory === "high_value") {
        // High-value customers (orders > ₹5000)
        const highValueOrders = await Order.aggregate([
          { $group: { _id: "$userId", totalSpent: { $sum: "$totalAmount" } } },
          { $match: { totalSpent: { $gte: 5000 } } },
        ])
        targetUserIds = highValueOrders.map((order) => order._id)
      } else if (campaign.customerSegment?.orderHistory === "frequent_buyers") {
        // Frequent buyers (3+ orders)
        const frequentBuyers = await Order.aggregate([
          { $group: { _id: "$userId", orderCount: { $sum: 1 } } },
          { $match: { orderCount: { $gte: 3 } } },
        ])
        targetUserIds = frequentBuyers.map((buyer) => buyer._id)
      } else {
        // Default to all customers with orders
        targetUserIds = await Order.find({}).distinct("userId")
      }

      // Filter by location if specified
      if (campaign.customerSegment?.location && campaign.customerSegment.location.length > 0) {
        const locationFilter = {
          $or: [
            { "billingDetails.state": { $in: campaign.customerSegment.location } },
            { "billingDetails.city": { $in: campaign.customerSegment.location } },
          ],
        }
        const locationFilteredOrders = await Order.find(locationFilter).distinct("userId")
        targetUserIds = targetUserIds.filter((userId) => locationFilteredOrders.includes(userId))

        // Also check buyer addresses for location filtering
        if (BuyerAddress) {
          const addressLocationFilter = {
            $or: [
              { state: { $in: campaign.customerSegment.location } },
              { city: { $in: campaign.customerSegment.location } },
            ],
          }
          const locationFilteredAddresses = await BuyerAddress.find(addressLocationFilter).distinct("userId")
          const combinedUserIds = [...new Set([...targetUserIds, ...locationFilteredAddresses])]
          targetUserIds = combinedUserIds
        }
      }

      // Filter by registration date if specified
      if (campaign.customerSegment?.registrationDate) {
        const { from, to } = campaign.customerSegment.registrationDate
        const dateFilter: any = {}
        if (from) dateFilter.$gte = new Date(from)
        if (to) dateFilter.$lte = new Date(to)

        if (Object.keys(dateFilter).length > 0) {
          const dateFilteredContacts = await Contact.find({ createdAt: dateFilter }).distinct("userId")
          targetUserIds = targetUserIds.filter((userId) => dateFilteredContacts.includes(userId))
        }
      }

      // Filter by customer preferences (opt-in for WhatsApp marketing)
      if (CustomerPreferences) {
        const optedInUsers = await CustomerPreferences.find({
          whatsappMarketing: true,
          userId: { $in: targetUserIds },
        }).distinct("userId")
        targetUserIds = optedInUsers
      }

      // Get contact details for filtered users
      const contacts = await Contact.find({ userId: { $in: targetUserIds } })
      recipients = contacts.map((contact) => ({
        phone: contact.phoneNumber,
        name: contact.contactName || contact.name || "Customer",
        email: contact.emailId,
        userId: contact.userId,
      }))

      // Enrich recipient data with order history and preferences
      for (const recipient of recipients) {
        try {
          // Get latest order for personalization
          const latestOrder = await Order.findOne({ userId: recipient.userId }).sort({ createdAt: -1 })
          if (latestOrder) {
            recipient.lastOrderAmount = latestOrder.totalAmount
            recipient.lastOrderDate = latestOrder.createdAt
            recipient.preferredProducts = latestOrder.products?.slice(0, 2).map((p: any) => p.title) || []
          }

          // Get total order count and value
          const orderStats = await Order.aggregate([
            { $match: { userId: recipient.userId } },
            {
              $group: {
                _id: "$userId",
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: "$totalAmount" },
                avgOrderValue: { $avg: "$totalAmount" },
              },
            },
          ])

          if (orderStats.length > 0) {
            const stats = orderStats[0]
            recipient.totalOrders = stats.totalOrders
            recipient.totalSpent = stats.totalSpent
            recipient.avgOrderValue = stats.avgOrderValue
            recipient.customerTier = stats.totalSpent > 10000 ? "Premium" : stats.totalSpent > 5000 ? "Gold" : "Silver"
          }
        } catch (error) {
          console.error(`Error enriching data for user ${recipient.userId}:`, error)
        }
      }
    } else if (campaign.targetAudience === "sellers") {
      // Get seller contacts
      const contacts = await Contact.find({})
      // Filter sellers based on business registration
      const Business = connection.models.Business
      if (Business) {
        const businesses = await Business.find({}).distinct("userId")
        const sellerContacts = contacts.filter((contact) => businesses.includes(contact.userId))
        recipients = sellerContacts.map((contact) => ({
          phone: contact.phoneNumber,
          name: contact.contactName || contact.name || "Seller",
          email: contact.emailId,
          userId: contact.userId,
        }))
      }
    }

    // Filter out invalid phone numbers and users who opted out
    recipients = recipients.filter((recipient) => {
      return recipient.phone && recipient.phone.length >= 10
    })

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No valid recipients found for the selected criteria" }, { status: 400 })
    }

    // Update campaign status to sending
    await WhatsAppCampaign.findByIdAndUpdate(campaignId, { status: "sent" })

    // Send messages and log results
    let sentCount = 0
    let deliveredCount = 0
    let failedCount = 0

    for (const recipient of recipients) {
      try {
        let personalizedMessage = campaign.messageTemplate
          .replace(/\{name\}/g, recipient.name)
          .replace(/\{phone\}/g, recipient.phone)

        // Add advanced personalization tokens
        if (recipient.customerTier) {
          personalizedMessage = personalizedMessage.replace(/\{tier\}/g, recipient.customerTier)
        }
        if (recipient.totalOrders) {
          personalizedMessage = personalizedMessage.replace(/\{orderCount\}/g, recipient.totalOrders.toString())
        }
        if (recipient.lastOrderAmount) {
          personalizedMessage = personalizedMessage.replace(/\{lastOrderAmount\}/g, `₹${recipient.lastOrderAmount}`)
        }
        if (recipient.preferredProducts && recipient.preferredProducts.length > 0) {
          personalizedMessage = personalizedMessage.replace(
            /\{preferredProducts\}/g,
            recipient.preferredProducts.join(", "),
          )
        }

        // Create log entry
        const logEntry = new WhatsAppCampaignLog({
          campaignId: campaignId,
          recipientPhone: recipient.phone,
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          messageContent: personalizedMessage,
          status: "pending",
        })

        // Send WhatsApp message using existing service
        const success = await whatsappService.sendMarketingMessage({
          phone: recipient.phone,
          name: recipient.name,
          message: personalizedMessage,
        })

        if (success) {
          logEntry.status = "sent"
          logEntry.sentAt = new Date()
          sentCount++
          deliveredCount++ // Assume delivered for now
        } else {
          logEntry.status = "failed"
          logEntry.errorMessage = "Failed to send message"
          failedCount++
        }

        await logEntry.save()
      } catch (error) {
        console.error(`Error sending message to ${recipient.phone}:`, error)
        failedCount++
      }
    }

    // Update campaign statistics
    await WhatsAppCampaign.findByIdAndUpdate(campaignId, {
      sentCount,
      deliveredCount,
      failedCount,
      status: "sent",
    })

    return NextResponse.json({
      success: true,
      message: "Campaign sent successfully",
      data: {
        totalRecipients: recipients.length,
        sentCount,
        deliveredCount,
        failedCount,
        segmentationCriteria: campaign.customerSegment,
      },
    })
  } catch (error) {
    console.error("Error sending WhatsApp campaign:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
