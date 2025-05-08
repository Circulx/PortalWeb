"use client"

import type React from "react"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCart, syncCart } from "@/store/slices/cartSlice"
import type { AppDispatch, RootState } from "@/store"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const { items, initialized } = useSelector((state: RootState) => state.cart)

  // Initialize cart from database
  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCart())
    }
  }, [dispatch, initialized])

  // Sync cart to database when items change
  useEffect(() => {
    if (initialized && items.length > 0) {
      const timeoutId = setTimeout(() => {
        dispatch(syncCart(items))
      }, 1000) // Debounce for 1 second

      return () => clearTimeout(timeoutId)
    }
  }, [dispatch, items, initialized])

  return <>{children}</>
}

export default CartProvider
