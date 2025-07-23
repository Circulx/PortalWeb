import mongoose from "mongoose"
import type { IBusinessDetails } from "@/models/profile/business"
import type { IContactDetails } from "@/models/profile/contact"
import type { IAddress } from "@/models/profile/address"
import type { IBank } from "@/models/profile/bank"
import type { IDocument } from "@/models/profile/document"
import type { IProfileProgress } from "@/models/profile/progress"

const PROFILE_DB_URI =
  process.env.PROFILE_DB ||
  "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"

// Global connection cache
let isConnected = false

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

// Review interface with complete order items
interface IReview {
  orderId: string
  userId: string
  product_id: string
  rating: number
  review: string
  status: "pending" | "approved" | "rejected"
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

// Buyer Address interface
interface IBuyerAddress {
  userId: string
  firstName: string
  lastName: string
  companyName?: string
  address: string
  country: string
  state: string
  city: string
  zipCode: string
  email: string
  phoneNumber: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export async function connectProfileDB() {
  if (isConnected) {
    console.log("Using existing database connection")
    return mongoose
  }

  try {
    console.log("Creating new database connection...")

    // Disconnect any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    const connection = await mongoose.connect(PROFILE_DB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    })

    isConnected = true
    console.log("Database connected successfully")

    // Register all models
    registerModels()

    return connection
  } catch (error) {
    console.error("Database connection failed:", error)
    isConnected = false
    throw error
  }
}

export async function disconnectProfileDB() {
  if (isConnected) {
    await mongoose.disconnect()
    isConnected = false
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
        product_id: { type: String, required: true },
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

// Define Review schema with enhanced orderItems structure
const ReviewSchema = new mongoose.Schema<IReview>(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    product_id: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews", // Explicitly specify collection name
  },
)

// Add indexes for efficient querying
ReviewSchema.index({ createdAt: -1 })
ReviewSchema.index({ rating: 1 })
ReviewSchema.index({ status: 1, createdAt: -1 })
ReviewSchema.index({ orderId: 1, userId: 1 }, { unique: true }) // Prevent duplicate reviews

// Define BuyerAddress schema
const BuyerAddressSchema = new mongoose.Schema<IBuyerAddress>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "buyeraddresses", // Explicitly specify collection name
  },
)

// Index for faster queries
BuyerAddressSchema.index({ userId: 1, createdAt: -1 })
BuyerAddressSchema.index({ userId: 1, isDefault: 1 })

// Update the registerModels function to include all models
function registerModels() {
  console.log("Registering models...")

  // Only register models if they don't already exist
  if (!mongoose.models.Business) {
    mongoose.model("Business", BusinessSchema)
    console.log("Registered Business model")
  }
  if (!mongoose.models.Contact) {
    mongoose.model("Contact", ContactSchema)
    console.log("Registered Contact model")
  }
  if (!mongoose.models.CategoryBrand) {
    mongoose.model("CategoryBrand", CategoryBrandSchema)
    console.log("Registered CategoryBrand model")
  }
  if (!mongoose.models.Address) {
    mongoose.model("Address", AddressSchema)
    console.log("Registered Address model")
  }
  if (!mongoose.models.Bank) {
    mongoose.model("Bank", BankSchema)
    console.log("Registered Bank model")
  }
  if (!mongoose.models.Document) {
    mongoose.model("Document", DocumentSchema)
    console.log("Registered Document model")
  }
  if (!mongoose.models.ProfileProgress) {
    mongoose.model("ProfileProgress", ProfileProgressSchema)
    console.log("Registered ProfileProgress model")
  }
  if (!mongoose.models.Product) {
    mongoose.model("Product", ProductSchema)
    console.log("Registered Product model")
  }
  if (!mongoose.models.Order) {
    mongoose.model("Order", OrderSchema)
    console.log("Registered Order model")
  }
  if (!mongoose.models.Cart) {
    mongoose.model("Cart", CartSchema)
    console.log("Registered Cart model")
  }
  if (!mongoose.models.Wishlist) {
    mongoose.model("Wishlist", WishlistSchema)
    console.log("Registered Wishlist model")
  }
  if (!mongoose.models.Advertisement) {
    mongoose.model("Advertisement", AdvertisementSchema)
    console.log("Registered Advertisement model")
  }
  if (!mongoose.models.Review) {
    mongoose.model("Review", ReviewSchema)
    console.log("Registered Review model")
  }
  if (!mongoose.models.BuyerAddress) {
    mongoose.model("BuyerAddress", BuyerAddressSchema)
    console.log("Registered BuyerAddress model")
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
  BuyerAddressSchema,
}
