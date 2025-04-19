import { configureStore } from "@reduxjs/toolkit"
import cartReducer from "@/store/slices/cartSlice"
import productReducer from "@/store/slices/productSlice"
import wishlistReducer from "@/store/slices/wishlistSlice"

const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
    wishlist: wishlistReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
export { store }
