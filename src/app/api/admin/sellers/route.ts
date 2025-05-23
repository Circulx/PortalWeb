import { NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define interfaces for our data
interface Business {
  userId: string
  legalEntityName?: string
  tradeName?: string
  gstin?: string // Add gstin to the Business interface
  createdAt?: string | Date
  [key: string]: any // For other properties
}

interface Contact {
  userId: string
  emailId?: string
  phoneNumber?: string
  [key: string]: any // For other properties
}

interface ProfileProgress {
  userId: string
  status: "Approved" | "Reject" | "Review"
}

interface ContactMap {
  [userId: string]: Contact
}

interface ProgressMap {
  [userId: string]: ProfileProgress
}

export async function GET() {
  try {
    console.log("Fetching sellers from profile database")
    const db = await connectProfileDB()

    // Get the Business model
    const BusinessSchema = new mongoose.Schema({}, { strict: false })
    const Business = db.models.Business || db.model("Business", BusinessSchema)

    // Get the Contact model
    const ContactSchema = new mongoose.Schema({}, { strict: false })
    const Contact = db.models.Contact || db.model("Contact", ContactSchema)

    // Get the ProfileProgress model
    const ProfileProgressSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, index: true },
        completedSteps: [{ type: String, required: true }],
        currentStep: { type: String, required: true },
        status: {
          type: String,
          enum: ["Approved", "Reject", "Review"],
          default: "Review", // Default status
        },
      },
      { timestamps: true },
    )
    const ProfileProgress = db.models.ProfileProgress || db.model("ProfileProgress", ProfileProgressSchema)

    // Fetch all businesses
    const businesses = (await Business.find({}).lean()) as unknown as Business[]
    console.log(`Found ${businesses.length} businesses`)

    // Fetch all contacts
    const contacts = (await Contact.find({}).lean()) as unknown as Contact[]
    console.log(`Found ${contacts.length} contacts`)

    // Fetch all profile progresses
    const progresses = (await ProfileProgress.find({}).lean()) as unknown as ProfileProgress[]
    console.log(`Found ${progresses.length} profile progresses`)

    // Create a map of contacts by userId for quick lookup
    const contactsByUserId = contacts.reduce((acc: ContactMap, contact: Contact) => {
      if (contact.userId) {
        acc[contact.userId] = contact
      }
      return acc
    }, {})

    // Create a map of profile progresses by userId for quick lookup
    const progressesByUserId = progresses.reduce((acc: ProgressMap, progress: ProfileProgress) => {
      if (progress.userId) {
        acc[progress.userId] = progress
      }
      return acc
    }, {})

    // Combine business, contact, and profile progress data
    const sellers = businesses.map((business: Business) => {
      const contact = contactsByUserId[business.userId] || {}
      const progress = progressesByUserId[business.userId] || { status: "Review" } // Default status

      return {
        _id: business.userId, // Include the userId as _id
        id: business.gstin || "", // Use gstin instead of userId
        name: business.legalEntityName || "",
        tradeName: business.tradeName || "",
        email: contact.emailId || "",
        phone: contact.phoneNumber || "",
        registeredDate: business.createdAt ? new Date(business.createdAt).toLocaleDateString() : "",
        status: progress.status || "Review", // Include the status
      }
    })

    return NextResponse.json(sellers)
  } catch (error) {
    console.error("Error fetching sellers:", error)
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 })
  }
}
