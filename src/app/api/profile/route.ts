import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"

// Helper function to safely find one document
async function safelyFindOne(model: any, query: any) {
  try {
    return await model.findOne(query).exec()
  } catch (error) {
    console.error(`Error finding document: ${error}`)
    return null
  }
}

// Helper to serialize MongoDB documents
function serializeDocument(doc: any): any {
  if (!doc) return null

  // Handle Date objects
  if (doc instanceof Date) {
    return doc.toISOString()
  }

  // Handle Mongoose documents with _doc property (most common case)
  if (doc._doc) {
    const plainData = { ...doc._doc }
    // Convert ObjectId to string
    if (plainData._id && typeof plainData._id === "object" && plainData._id.toString) {
      plainData._id = plainData._id.toString()
    }
    return plainData
  }

  // Handle Mongoose documents with toObject method
  if (doc.toObject) {
    const plainObj = doc.toObject({ getters: true, virtuals: true })
    return JSON.parse(JSON.stringify(plainObj))
  }

  // Handle ObjectId
  if (doc._id && typeof doc._id === "object" && doc._id.toString) {
    return { ...doc, _id: doc._id.toString() }
  }

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item))
  }

  // Handle plain objects
  if (typeof doc === "object" && doc !== null) {
    const serialized: Record<string, any> = {}
    for (const [key, value] of Object.entries(doc)) {
      serialized[key] = serializeDocument(value)
    }
    return serialized
  }

  // Return primitive values as is
  return doc
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const db = await connectProfileDB()

    // Safely get models with error handling
    let Business, Contact, CategoryBrand, Address, Bank, Document, ProfileProgress

    try {
      // Try to get models, or register them if they don't exist
      try {
        Business = db.model("Business")
      } catch (e) {
        const { BusinessSchema } = await import("@/lib/profileDb")
        Business = db.model("Business", BusinessSchema)
      }

      try {
        Contact = db.model("Contact")
      } catch (e) {
        const { ContactSchema } = await import("@/lib/profileDb")
        Contact = db.model("Contact", ContactSchema)
      }

      try {
        CategoryBrand = db.model("CategoryBrand")
      } catch (e) {
        const { CategoryBrandSchema } = await import("@/lib/profileDb")
        CategoryBrand = db.model("CategoryBrand", CategoryBrandSchema)
      }

      try {
        Address = db.model("Address")
      } catch (e) {
        const { AddressSchema } = await import("@/lib/profileDb")
        Address = db.model("Address", AddressSchema)
      }

      try {
        Bank = db.model("Bank")
      } catch (e) {
        const { BankSchema } = await import("@/lib/profileDb")
        Bank = db.model("Bank", BankSchema)
      }

      try {
        Document = db.model("Document")
      } catch (e) {
        const { DocumentSchema } = await import("@/lib/profileDb")
        Document = db.model("Document", DocumentSchema)
      }

      try {
        ProfileProgress = db.model("ProfileProgress")
      } catch (e) {
        const { ProfileProgressSchema } = await import("@/lib/profileDb")
        ProfileProgress = db.model("ProfileProgress", ProfileProgressSchema)
      }
    } catch (error) {
      console.error("Error getting models:", error)
      return NextResponse.json({ error: "Failed to access profile models" }, { status: 500 })
    }

    // Fetch all profile data for the user
    const business = await safelyFindOne(Business, { userId: user.id })
    const contact = await safelyFindOne(Contact, { userId: user.id })
    const category = await safelyFindOne(CategoryBrand, { userId: user.id })
    const address = await safelyFindOne(Address, { userId: user.id })
    const bank = await safelyFindOne(Bank, { userId: user.id })
    const document = await safelyFindOne(Document, { userId: user.id })
    const progress = await safelyFindOne(ProfileProgress, { userId: user.id })

    // Debug: Log the raw data from database
    console.log("API - Raw business data:", business)
    console.log("API - Raw contact data:", contact)
    console.log("API - Raw category data:", category)
    console.log("API - Raw address data:", address)
    console.log("API - Raw bank data:", bank)
    console.log("API - Raw document data:", document)
    
    // Debug: Check if data exists
    console.log("API - Business exists:", !!business)
    console.log("API - Contact exists:", !!contact)
    console.log("API - Category exists:", !!category)
    console.log("API - Address exists:", !!address)
    console.log("API - Bank exists:", !!bank)
    console.log("API - Document exists:", !!document)

    // Debug: Test serialization
    console.log("API - Testing serialization for business:", business)
    const serializedBusiness = serializeDocument(business)
    console.log("API - Serialized business result:", serializedBusiness)
    
    // Ensure all data is properly serialized
    const serializedData = {
      business: serializedBusiness,
      contact: serializeDocument(contact),
      category: serializeDocument(category),
      address: serializeDocument(address),
      bank: serializeDocument(bank),
      document: serializeDocument(document),
      progress: progress
        ? {
            completedSteps: progress.completedSteps,
            currentStep: progress.currentStep || "business",
          }
        : {
            completedSteps: [],
            currentStep: "business",
          },
    }

    // Debug: Log the serialized data before JSON conversion
    console.log("API - Serialized data before JSON:", serializedData)
    console.log("API - Business data before JSON:", serializedData.business)
    
    // Convert to plain JSON to ensure no methods are passed
    const safeData = JSON.parse(JSON.stringify(serializedData))

    // Debug: Log the final safe data
    console.log("API - Final safe data:", safeData)
    console.log("API - Business data specifically:", safeData.business)
    console.log("API - Contact data specifically:", safeData.contact)

    // Try returning the serialized data directly without JSON conversion
    return NextResponse.json({
      success: true,
      data: serializedData,
    })
  } catch (error) {
    console.error("Error in GET /api/profile:", error)
    return NextResponse.json({ error: "Failed to get profile data" }, { status: 500 })
  }
}
