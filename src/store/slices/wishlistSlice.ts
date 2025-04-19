import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

// Define the type for wishlist items
interface WishlistItem {
  units: any
  stock: any
  id: string
  title: string
  image_link: string
  price: number
  discount?: number
  seller_id: number
}

// Define the wishlist state structure
interface WishlistState {
  items: WishlistItem[]
}

// Initial state for the wishlist
const initialState: WishlistState = {
  items: [],
}

// Create the wishlist slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Add an item to the wishlist
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      // Check if the item already exists in the wishlist
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      // Only add the item if it doesn't already exist in the wishlist
      if (!existingItem) {
        state.items.push(action.payload)
      }
    },

    // Remove an item from the wishlist
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      // Filter out the item with the matching id
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    // Clear all items from the wishlist
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

// Export the actions and reducer
export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
