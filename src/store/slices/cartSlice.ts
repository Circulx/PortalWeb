import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

interface CartItem {
  id: string
  title: string
  image_link: string
  price: number
  quantity: number
  discount?: number
  seller_id: number
  stock: number // Add stock property
  units?: string // Add units property
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}

// Async thunk to fetch product stock
export const fetchProductStock = createAsyncThunk("cart/fetchProductStock", async (productId: string) => {
  try {
    const response = await axios.get(`/api/products/stock?id=${productId}`)
    return response.data.stock
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product stock")
  }
})

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ item: Omit<CartItem, "stock">; stock: number }>) => {
      const { item, stock } = action.payload
      const existingItem = state.items.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        // If the item exists, update the quantity but limit it to the available stock
        existingItem.quantity = Math.min(existingItem.quantity + 1, stock)
      } else {
        // If the item doesn't exist, add it to the cart with a quantity of 1 or the available stock, whichever is smaller
        state.items.push({ ...item, quantity: 1, stock })
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity < item.stock) {
        item.quantity += 1
      }
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity > 1) {
        item.quantity -= 1
      }
    },
    clearCart: (state) => {
      ;(state.items = []), (state.loading = false), (state.error = null)
    },
    updateItemStock: (state, action: PayloadAction<{ productId: string; stock: number }>) => {
      const { productId, stock } = action.payload
      const item = state.items.find((item) => item.id === productId)
      if (item) {
        item.stock = stock
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductStock.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductStock.fulfilled, (state, action: PayloadAction<number, string, { arg: string }>) => {
        state.loading = false
        const productId = action.meta.arg // Access productId from meta
        const item = state.items.find((item) => item.id === productId)
        if (item) {
          item.stock = action.payload
        }
      })
      .addCase(fetchProductStock.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch product stock"
      })
  },
})

export const { addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart, updateItemStock } = cartSlice.actions
export default cartSlice.reducer
