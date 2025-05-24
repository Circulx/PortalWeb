import { NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

// Define the Cart schema (same as in other cart routes)
interface CartItem {
  id: string
  title: string
  image_link?: string
  price: number
  discount: number
  units?: string
  quantity: number
  stock: number
}

interface Cart {
  userId: string
  items: CartItem[]
  updatedAt: Date
}

const CartSchema = new mongoose.Schema<Cart>(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        image_link: { type: String },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        units: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        stock: { type: Number, default: 0 },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Get or create the Cart model
const getCartModel = async () => {
  const connection = await connectProfileDB()
  try {
    return connection.model<Cart>("Cart")
  } catch (error) {
    return connection.model<Cart>("Cart", CartSchema)
  }
}

interface DecrementRequest {
  orderedItems: Array<{
    productId: string
    quantity: number
  }>
}

interface DecrementResponse {
  success: boolean
  message: string
  updatedItems: CartItem[]
  removedItems: string[]
  errors?: string[]
}

// POST handler - Decrement cart quantities after successful order placement
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          updatedItems: [],
          removedItems: [],
        },
        { status: 401 },
      )
    }

    const { orderedItems }: DecrementRequest = await request.json()

    if (!orderedItems || !Array.isArray(orderedItems) || orderedItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ordered items data",
          updatedItems: [],
          removedItems: [],
        },
        { status: 400 },
      )
    }

    const CartModel = await getCartModel()

    // Use a transaction to ensure atomicity
    const session = await mongoose.startSession()
    const errors: string[] = [] // Declare the errors variable here

    try {
      await session.withTransaction(async () => {
        // Get the current cart with session for consistency
        const cart = await CartModel.findOne({ userId: user.id }).session(session)

        if (!cart) {
          throw new Error("Cart not found")
        }

        const updatedItems: CartItem[] = []
        const removedItems: string[] = []

        // Process each ordered item
        for (const orderedItem of orderedItems) {
          const cartItemIndex = cart.items.findIndex((item) => item.id === orderedItem.productId)

          if (cartItemIndex === -1) {
            // Item not found in cart - this might be okay if user ordered from wishlist or direct product page
            continue
          }

          const cartItem = cart.items[cartItemIndex]
          const newQuantity = cartItem.quantity - orderedItem.quantity

          if (newQuantity < 0) {
            // This shouldn't happen in normal flow, but handle gracefully
            errors.push(`Product ${cartItem.title} has insufficient quantity in cart`)
            // Remove the item completely if ordered quantity exceeds cart quantity
            cart.items.splice(cartItemIndex, 1)
            removedItems.push(cartItem.id)
          } else if (newQuantity === 0) {
            // Remove item completely if quantity becomes 0
            cart.items.splice(cartItemIndex, 1)
            removedItems.push(cartItem.id)
          } else {
            // Update quantity
            cartItem.quantity = newQuantity
            updatedItems.push(cartItem)
          }
        }

        // Update the cart in database
        cart.updatedAt = new Date()
        await cart.save({ session })
      })

      await session.commitTransaction()

      // Get the updated cart to return
      const updatedCart = await CartModel.findOne({ userId: user.id }).lean()

      const response: DecrementResponse = {
        success: true,
        message: "Cart quantities updated successfully after order placement",
        updatedItems: updatedCart?.items || [],
        removedItems: [],
        ...(errors.length > 0 && { errors }),
      }

      return NextResponse.json(response)
    } catch (transactionError) {
      await session.abortTransaction()
      throw transactionError
    } finally {
      await session.endSession()
    }
  } catch (error) {
    console.error("Error decrementing cart quantities:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update cart quantities",
        updatedItems: [],
        removedItems: [],
      },
      { status: 500 },
    )
  }
}
