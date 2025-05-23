import type { ObjectId } from "mongoose"

export interface OrderProduct {
  image: any
  variant: any
  sku: any
  productId: string | ObjectId
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
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  companyName?: string
}

export interface OrderDocument {
  tax: number
  shippingCost: number
  subTotal: number
  paymentStatus: string
  shippingDetails: any
  _id: string | ObjectId
  userId: string | ObjectId
  products: OrderProduct[]
  billingDetails: BillingDetails
  totalAmount: number
  status: string
  paymentMethod: string
  createdAt: Date | string
  updatedAt: Date | string
  __v?: number
}

export interface SellerOrderDocument extends OrderDocument {
  sellerSubtotal: number
  originalTotal: number
}

export interface ProductDocument {
  _id: string | ObjectId
  title: string
  description: string
  price: number
  discountPercentage?: number
  rating?: number
  stock: number
  brand: string
  category: string
  thumbnail?: string
  images?: string[]
  seller_id: string | ObjectId
  status?: string
  __v?: number
  [key: string]: any
}

// Type for Mongoose lean() results
export type LeanDocument<T> = {
  [P in keyof T]?: T[P] extends ObjectId
    ? string
    : T[P] extends Date
      ? string
      : T[P] extends object
        ? LeanDocument<T[P]>
        : T[P]
} & { _id?: string | ObjectId; __v?: number }
