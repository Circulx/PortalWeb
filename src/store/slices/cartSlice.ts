import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

interface CartItem {
  id: string
  productId: string // Add productId for database synchronization
  title: string
  image_link: string
  price: number
  quantity: number
  discount: number
  seller_id: string | number // Update to accept either string or number
  stock: number
  units?: string
}

interface CartState {
  items: any[]
  loading: boolean
  error: string | null
  syncing: boolean
  initialized: boolean
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  syncing: false,
  initialized: false,
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

// Async thunk for fetching cart
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/api/cart")
    return response.data.items || []
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch cart")
  }
})

// Async thunk for updating cart
export const updateCart = createAsyncThunk("cart/updateCart", async (items: any[], { rejectWithValue }) => {
  try {
    const response = await axios.post("/api/cart", { items })
    return response.data.items
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update cart")
  }
})

// Async thunk to sync cart to database
export const syncCart = createAsyncThunk("cart/syncCart", async (items: CartItem[], { rejectWithValue }) => {
  try {
    // Convert Redux cart items to database format
    const dbItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      image_link: item.image_link,
      price: Number(item.price),
      discount: Number(item.discount || 0),
      seller_id: item.seller_id, // Pass as is, schema now handles mixed types
      units: item.units,
      quantity: Number(item.quantity || 1),
      stock: Number(item.stock || 0),
    }))

    const response = await axios.post("/api/cart", { items: dbItems })
    if (response.data.items) {
      return response.data.items
    }
    return rejectWithValue(response.data.error || "Failed to sync cart")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to sync cart")
  }
})

// Async thunk to add item to cart in database
export const addItemToDb = createAsyncThunk(
  "cart/addItemToDb",
  async (payload: { item: Omit<CartItem, "stock">; stock: number }, { rejectWithValue }) => {
    try {
      const { item, stock } = payload
      const dbItem = {
        productId: item.id,
        title: item.title,
        image_link: item.image_link,
        price: Number(item.price),
        discount: Number(item.discount || 0),
        seller_id: item.seller_id, // Pass as is, schema now handles mixed types
        units: item.units,
        quantity: Number(item.quantity || 1),
        stock: Number(stock),
      }

      const response = await axios.post("/api/cart/items", { item: dbItem })
      if (response.data.cart) {
        return response.data.cart.items
      }
      return rejectWithValue(response.data.error || "Failed to add item to cart")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add item to cart")
    }
  },
)

// Async thunk to remove item from cart in database
export const removeItemFromDb = createAsyncThunk(
  "cart/removeItemFromDb",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/cart/items?productId=${productId}`)
      if (response.data.cart) {
        return response.data.cart.items
      }
      return rejectWithValue(response.data.error || "Failed to remove item from cart")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove item from cart")
    }
  },
)

// Async thunk to update item quantity in database
export const updateItemQuantityInDb = createAsyncThunk(
  "cart/updateItemQuantityInDb",
  async (payload: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const { productId, quantity } = payload
      const response = await axios.put("/api/cart/items", {
        productId,
        updates: { quantity: Number(quantity) },
      })
      if (response.data.cart) {
        return response.data.cart.items
      }
      return rejectWithValue(response.data.error || "Failed to update item quantity")
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update item quantity")
    }
  },
)

// Async thunk to clear cart in database
export const clearCartInDb = createAsyncThunk("cart/clearCartInDb", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.delete("/api/cart")
    if (response.data.message) {
      return true
    }
    return rejectWithValue(response.data.error || "Failed to clear cart")
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to clear cart")
  }
})

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { item, stock } = action.payload
      const existingItem = state.items.find((cartItem) => cartItem.id === item.id)

      if (existingItem) {
        // If item already exists, increase quantity (up to stock limit)
        if (existingItem.quantity < stock) {
          existingItem.quantity += 1
        }
      } else {
        // Add new item with quantity 1
        state.items.push({ ...item, quantity: 1, stock })
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    increaseQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity < item.stock) {
        item.quantity += 1
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload)
      if (item && item.quantity > 1) {
        item.quantity -= 1
      }
    },
    updateItemStock: (state, action) => {
      const { productId, stock } = action.payload
      const item = state.items.find((item) => item.id === productId)
      if (item) {
        item.stock = stock
      }
    },
    clearCart: (state) => {
      state.items = []
      state.loading = false
      state.error = null
    },
    setCartFromDb: (state, action: PayloadAction<any>) => {
      const dbCart = action.payload
      if (dbCart && Array.isArray(dbCart)) {
        // Convert database items to Redux format
        state.items = dbCart.map((item: any) => ({
          id: item.id,
          productId: item.id,
          title: item.title,
          image_link: item.image_link,
          price: Number(item.price),
          quantity: Number(item.quantity),
          discount: Number(item.discount || 0),
          seller_id: item.seller_id, // Accept as is
          stock: Number(item.stock || 0),
          units: item.units,
        }))
      }
      state.initialized = true
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProductStock
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

      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.initialized = true
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.initialized = true // Mark as initialized even if there was an error
      })
      .addCase(updateCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // syncCart
      .addCase(syncCart.pending, (state) => {
        state.syncing = true
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.syncing = false
        state.items = action.payload
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.syncing = false
        state.error = (action.payload as string) || "Failed to sync cart"
      })

      // addItemToDb
      .addCase(addItemToDb.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
        }
      })

      // removeItemFromDb
      .addCase(removeItemFromDb.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
        }
      })

      // updateItemQuantityInDb
      .addCase(updateItemQuantityInDb.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload
        }
      })

      // clearCartInDb
      .addCase(clearCartInDb.fulfilled, (state) => {
        state.items = []
      })
  },
})

export const { addItem, removeItem, increaseQuantity, decreaseQuantity, updateItemStock, clearCart, setCartFromDb } =
  cartSlice.actions

export default cartSlice.reducer
