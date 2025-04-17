import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

// Define the Product interface
export interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: object
  image_link: string
  stock: number
  price: number
  discount: number
  SKU: string
  seller_id: number
  created_at?: string
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

// Define the state structure
interface ProductState {
  products: Product[]
  categorySubcategoryProducts: Record<string, Record<string, Product[]>>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: number | null
}

// Initial state
const initialState: ProductState = {
  products: [],
  categorySubcategoryProducts: {},
  status: "idle",
  error: null,
  lastFetched: null,
}

// Create async thunk for fetching products
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (_, { getState, rejectWithValue }) => {
  const state = getState() as { products: ProductState }

  // If products are already loaded and it's been less than 30 minutes, don't fetch again
  const thirtyMinutesInMs = 30 * 60 * 1000
  if (
    state.products.products.length > 0 &&
    state.products.lastFetched &&
    Date.now() - state.products.lastFetched < thirtyMinutesInMs
  ) {
    return {
      products: state.products.products,
      categorySubcategoryProducts: state.products.categorySubcategoryProducts,
    }
  }

  try {
    const response = await axios.get("/api/products")

    if (response.data.error) {
      throw new Error(response.data.error)
    }

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from API")
    }

    const products: Product[] = response.data

    // Add fallback values for missing fields
    const processedProducts = products.map((product) => {
      const price = product.price || 0
      const discount = product.discount || 0
      const originalPrice = discount > 0 ? price / (1 - discount / 100) : price

      return {
        ...product,
        seller_name: product.seller_name || "Unknown Seller",
        location: product.location || "Unknown Location",
        rating: product.rating || 0,
        discount: product.discount || 0,
        image_link: product.image_link || "/placeholder.svg?height=200&width=200",
        price: price, // Ensure price is correctly assigned
        originalPrice: Number(originalPrice.toFixed(0)), // Ensure originalPrice is correctly calculated and formatted
      }
    })

    // Group products by category and subcategory
    const groupedProducts: Record<string, Record<string, Product[]>> = {}

    processedProducts.forEach((product) => {
      const category = product.category_name || "Uncategorized"
      const subcategory = product.sub_category_name || "Uncategorized"

      if (!groupedProducts[category]) {
        groupedProducts[category] = {}
      }

      if (!groupedProducts[category][subcategory]) {
        groupedProducts[category][subcategory] = []
      }

      groupedProducts[category][subcategory].push(product)
    })

    return {
      products: processedProducts,
      categorySubcategoryProducts: groupedProducts,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return rejectWithValue(`Failed to load products: ${errorMessage}`)
  }
})

// Create the slice
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.products = []
      state.categorySubcategoryProducts = {}
      state.status = "idle"
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading"
      })
      .addCase(
        fetchProducts.fulfilled,
        (
          state,
          action: PayloadAction<{
            products: Product[]
            categorySubcategoryProducts: Record<string, Record<string, Product[]>>
          }>,
        ) => {
          state.status = "succeeded"
          state.products = action.payload.products
          state.categorySubcategoryProducts = action.payload.categorySubcategoryProducts
          state.lastFetched = Date.now()
          state.error = null
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearProducts } = productSlice.actions
export default productSlice.reducer
