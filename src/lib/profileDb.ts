import mongoose, { type Connection } from "mongoose"
import type { IBusinessDetails } from "@/models/profile/business"
import type { IContactDetails } from "@/models/profile/contact"
import type { IAddress } from "@/models/profile/address"
import type { IBank } from "@/models/profile/bank"
import type { IDocument } from "@/models/profile/document"
import type { IProfileProgress } from "@/models/profile/progress"

const PROFILE_DB =
  process.env.PROFILE_DB ||
  "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Define the interface locally to avoid import issues
interface ICategoryBrand {
  userId: string
  categories: string[]
  authorizedBrands: string[]
}

// Cache the database connection
let cachedConnection: Connection | null = null
let connectionPromise: Promise<Connection> | null = null

export async function connectProfileDB(): Promise<Connection> {
  // If we already have a connection, return it
  if (cachedConnection) {
    console.log("Using existing profile database connection")
    return cachedConnection
  }

  // If we're already connecting, return the promise
  if (connectionPromise) {
    console.log("Reusing profile database connection promise")
    return connectionPromise
  }

  console.log("Creating new profile database connection")

  // Create a new connection promise with increased timeouts
  connectionPromise = mongoose
    .createConnection(PROFILE_DB, {
      serverSelectionTimeoutMS: 60000, // Increase from 30000 to 60000
      socketTimeoutMS: 90000, // Increase from 45000 to 90000
      connectTimeoutMS: 60000, // Add explicit connect timeout
    })
    .asPromise()
    .then((conn) => {
      console.log("Profile database connected successfully")
      cachedConnection = conn
      // Register models with the connection
      registerModels(conn)
      return conn
    })
    .catch((error) => {
      console.error("Profile database connection error:", error)
      connectionPromise = null
      throw error
    })

  return connectionPromise
}

export async function disconnectProfileDB() {
  if (cachedConnection) {
    await cachedConnection.close()
    cachedConnection = null
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
      default: "Review", // Default status
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
        seller_id:{type: String, required: true},
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

// Add the CartSchema after the OrderSchema

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

// Update the registerModels function to include the Cart model
function registerModels(connection: Connection) {
  // Only register models if they don't already exist
  if (!connection.models.Business) {
    connection.model("Business", BusinessSchema)
  }
  if (!connection.models.Contact) {
    connection.model("Contact", ContactSchema)
  }
  if (!connection.models.CategoryBrand) {
    connection.model("CategoryBrand", CategoryBrandSchema)
  }
  if (!connection.models.Address) {
    connection.model("Address", AddressSchema)
  }
  if (!connection.models.Bank) {
    connection.model("Bank", BankSchema)
  }
  if (!connection.models.Document) {
    connection.model("Document", DocumentSchema)
  }
  if (!connection.models.ProfileProgress) {
    connection.model("ProfileProgress", ProfileProgressSchema)
  }
  if (!connection.models.Product) {
    connection.model("Product", ProductSchema)
  }
  if (!connection.models.Order) {
    connection.model("Order", OrderSchema)
  }
  if (!connection.models.Cart) {
    connection.model("Cart", CartSchema)
  }
  if (!connection.models.Wishlist) {
    connection.model("Wishlist", WishlistSchema)
  }
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
}
