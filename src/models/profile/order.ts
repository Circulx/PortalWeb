import mongoose from "mongoose"

// Define the order schema
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    products: [
      {
        productId: { type: String, required: true },
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
      enum: [
        "PENDING",
        "pending",
        "PROCESSING",
        "processing",
        "SHIPPED",
        "shipped",
        "DELIVERED",
        "delivered",
        "CANCELLED",
        "cancelled",
      ],
      default: "PENDING",
    },
    additionalNotes: String,
  },
  { timestamps: true },
)

export default orderSchema

// Define TypeScript interfaces for the order
export interface OrderProduct {
  productId: string
  title: string
  quantity: number
  price: number
  image_link?: string
}

export interface BillingDetails {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface PaymentDetails {
  paymentId?: string
  orderId?: string
  signature?: string
}

export interface Order {
  _id?: string
  userId: string
  products: OrderProduct[]
  billingDetails?: BillingDetails
  totalAmount: number
  subTotal: number
  discount?: number
  tax?: number
  warehouseSelected?: boolean
  warehouseId?: string
  logisticsSelected?: boolean
  logisticsId?: string
  paymentMethod: "COD" | "ONLINE"
  paymentDetails?: PaymentDetails
  status?:
    | "PENDING"
    | "pending"
    | "PROCESSING"
    | "processing"
    | "SHIPPED"
    | "shipped"
    | "DELIVERED"
    | "delivered"
    | "CANCELLED"
    | "cancelled"
  additionalNotes?: string
  createdAt?: Date
  updatedAt?: Date
}
