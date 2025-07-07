import mongoose, { type Connection } from "mongoose"
import type { IBusinessDetails } from "@/models/profile/business"
import type { IContactDetails } from "@/models/profile/contact"
import type { IAddress } from "@/models/profile/address"
import type { IBank } from "@/models/profile/bank"
import type { IDocument } from "@/models/profile/document"
import type { IProfileProgress } from "@/models/profile/progress"

const PROFILE_DB =
  process.env.PROFILE_DB ||
  "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"

// Define the interface locally to avoid import issues
interface ICategoryBrand {
  userId: string
  categories: string[]
  authorizedBrands: string[]
}

// Advertisement interface
interface IAdvertisement {
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  startDate?: Date
  endDate?: Date
}

// Cache the database connection
let cachedConnection: Connection | null = null
let connectionPromise: Promise<{ connection: Connection; db: any }> | null = null

export async function connectProfileDB(): Promise<{ connection: Connection; db: any }> {
  // If we already have a connection, return it
  if (cachedConnection && cachedConnection.readyState === 1) {
    console.log("Using existing profile database connection")
    return { connection: cachedConnection, db: cachedConnection.db }
  }

  // If we're already connecting, return the promise
  if (connectionPromise) {
    console.log("Reusing profile database connection promise")
    return connectionPromise
  }

  console.log("Creating new profile database connection")
  console.log("Connecting to PROFILE_DB:", PROFILE_DB)

  // Create a new connection promise with correct options
  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      const connection = mongoose.createConnection(PROFILE_DB, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        bufferCommands: true, // Enable buffering to avoid the error
        retryWrites: true,
        w: "majority",
      })

      // Wait for connection to be ready
      connection.on("connected", () => {
        console.log("Profile database connected successfully")
        cachedConnection = connection
        registerModels(connection)
        resolve({ connection, db: connection.db })
      })

      connection.on("error", (error) => {
        console.error("Profile database connection error:", error)
        connectionPromise = null
        cachedConnection = null
        reject(error)
      })

      connection.on("disconnected", () => {
        console.log("Profile database disconnected")
        cachedConnection = null
        connectionPromise = null
      })
    } catch (error) {
      console.error("Profile database connection error:", error)
      connectionPromise = null
      cachedConnection = null
      reject(error)
    }
  })

  return connectionPromise
}

export async function disconnectProfileDB() {
  if (cachedConnection) {
    await cachedConnection.close()
    cachedConnection = null
    connectionPromise = null
  }
}

// Define schemas
const BusinessSchema = new mongoose.Schema<IBusinessDetails>(
  {
    userId: { type: String, required: true, index: true },
    legalEntityName: { type: String, required: true },
    tradeName: { type: String, required: true },
    gstin: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    businessEntityType: { type: String, required: true },
  },
  { timestamps: true },
)

const ContactSchema = new mongoose.Schema<IContactDetails>(
  {
    userId: { type: String, required: true, index: true },
    contactName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailId: { type: String, required: true },
    pickupTime: { type: String, required: true },
  },
  { timestamps: true },
)

const CategoryBrandSchema = new mongoose.Schema<ICategoryBrand>(
  {
    userId: { type: String, required: true, index: true },
    categories: [{ type: String, required: true }],
    authorizedBrands: [{ type: String, required: true }],
  },
  { timestamps: true },
)

const AddressSchema = new mongoose.Schema<IAddress>(
  {
    userId: { type: String, required: true, index: true },
    billingAddress: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      phoneNumber: { type: String, required: true },
    },
    pickupAddress: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      phoneNumber: { type: String, required: true },
    },
  },
  { timestamps: true },
)

const BankSchema = new mongoose.Schema<IBank>(
  {
    userId: { type: String, required: true, index: true },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    branch: { type: String, required: true },
    city: { type: String, required: true },
    accountType: { type: String, required: true },
    bankLetterUrl: { type: String, required: true },
  },
  { timestamps: true },
)

const DocumentSchema = new mongoose.Schema<IDocument>(
  {
    userId: { type: String, required: true, index: true },
    panCardUrl: { type: String, required: true },
    gstinUrl: { type: String, required: true },
    bankLetterUrl: { type: String, required: true },
    bankStatementUrl: { type: String, required: true },
    corporationCertificateUrl: { type: String, required: true },
    businessAddressUrl: { type: String, required: true },
    pickupAddressProofUrl: { type: String, required: true },
    signatureUrl: { type: String, required: true },
    balanceSheet2223Url: { type: String, required: true },
    balanceSheet2324Url: { type: String, required: true },
  },
  { timestamps: true },
)

const ProfileProgressSchema = new mongoose.Schema<IProfileProgress>(
  {
    userId: { type: String, required: true, index: true },
    completedSteps: [{ type: String, required: true }],
    currentStep: { type: String, required: true },
    status: {
      type: String,
      enum: ["Approved", "Reject", "Review"],
      default: "Review",
    },
  },
  { timestamps: true },
)

// Define Product schema
const ProductSchema = new mongoose.Schema({
  product_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  model: String,
  description: String,
  category_id: Number,
  sub_category_id: Number,
  units: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  image_link: String,
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: Number,
  SKU: { type: String, required: true },
  seller_id: String,
  emailId: { type: String, required: true },
  location: { type: String, required: true },
  category_name: { type: String, required: true },
  sub_category_name: String,
  is_draft: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
})

// Define Order schema
const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    products: [
      {
        productId: { type: String, required: true },
        seller_id: { type: String, required: true },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image_link: String,
      },
    ],
    billingDetails: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    totalAmount: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    warehouseSelected: { type: Boolean, default: false },
    warehouseId: String,
    logisticsSelected: { type: Boolean, default: false },
    logisticsId: String,
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentDetails: {
      paymentId: String,
      orderId: String,
      signature: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    additionalNotes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Define Cart schema
const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        image_link: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        discount: { type: Number, default: 0 },
        stock: { type: Number, required: true },
        units: { type: String },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Define Wishlist schema
const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        image_link: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        units: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Define Advertisement schema - Make sure this matches your database structure
const AdvertisementSchema = new mongoose.Schema<IAdvertisement>(
  {
    title: { type: String, required: true, maxlength: 100 },
    subtitle: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 500 },
    imageUrl: { type: String }, // External URL (optional)
    imageData: { type: String }, // Base64 encoded image data (optional)
    linkUrl: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    deviceType: {
      type: String,
      enum: ["all", "desktop", "mobile", "tablet"],
      default: "all",
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "advertisements", // Explicitly specify collection name
  },
)

// Add indexes for efficient querying
AdvertisementSchema.index({ isActive: 1, order: 1 })
AdvertisementSchema.index({ startDate: 1, endDate: 1 })
AdvertisementSchema.index({ deviceType: 1 })

// Define Review schema
const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "hidden", "reported"],
      default: "active",
    },
  },
  { timestamps: true },
)

// Add compound indexes for efficient querying
ReviewSchema.index({ userId: 1, orderId: 1 }, { unique: true })
ReviewSchema.index({ productId: 1, status: 1 })
ReviewSchema.index({ sellerId: 1, status: 1 })
ReviewSchema.index({ rating: 1 })

// Update the registerModels function to include all models
function registerModels(connection: Connection) {
  console.log("Registering models...")

  // Only register models if they don't already exist
  if (!connection.models.Business) {
    connection.model("Business", BusinessSchema)
    console.log("Registered Business model")
  }
  if (!connection.models.Contact) {
    connection.model("Contact", ContactSchema)
    console.log("Registered Contact model")
  }
  if (!connection.models.CategoryBrand) {
    connection.model("CategoryBrand", CategoryBrandSchema)
    console.log("Registered CategoryBrand model")
  }
  if (!connection.models.Address) {
    connection.model("Address", AddressSchema)
    console.log("Registered Address model")
  }
  if (!connection.models.Bank) {
    connection.model("Bank", BankSchema)
    console.log("Registered Bank model")
  }
  if (!connection.models.Document) {
    connection.model("Document", DocumentSchema)
    console.log("Registered Document model")
  }
  if (!connection.models.ProfileProgress) {
    connection.model("ProfileProgress", ProfileProgressSchema)
    console.log("Registered ProfileProgress model")
  }
  if (!connection.models.Product) {
    connection.model("Product", ProductSchema)
    console.log("Registered Product model")
  }
  if (!connection.models.Order) {
    connection.model("Order", OrderSchema)
    console.log("Registered Order model")
  }
  if (!connection.models.Cart) {
    connection.model("Cart", CartSchema)
    console.log("Registered Cart model")
  }
  if (!connection.models.Wishlist) {
    connection.model("Wishlist", WishlistSchema)
    console.log("Registered Wishlist model")
  }
  if (!connection.models.Advertisement) {
    connection.model("Advertisement", AdvertisementSchema)
    console.log("Registered Advertisement model")
  }
  if (!connection.models.Review) {
    connection.model("Review", ReviewSchema)
    console.log("Registered Review model")
  }

  console.log("All models registered successfully")
}

// Export schemas for use in other files
export {
  BusinessSchema,
  ContactSchema,
  CategoryBrandSchema,
  AddressSchema,
  BankSchema,
  DocumentSchema,
  ProfileProgressSchema,
  ProductSchema,
  OrderSchema,
  CartSchema,
  WishlistSchema,
  AdvertisementSchema,
  ReviewSchema,
}

export default connectProfileDB
