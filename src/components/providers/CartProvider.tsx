"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchCart, syncCart } from "@/store/slices/cartSlice"
import type { AppDispatch, RootState } from "@/store"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const { items, initialized, syncing } = useSelector((state: RootState) => state.cart)
  const previousItemsRef = useRef<any[]>([])

  // Initialize cart from database
  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCart())
    }
  }, [dispatch, initialized])

  // Sync cart to database when items change
  useEffect(() => {
    // Skip if not initialized or already syncing
    if (!initialized || syncing) {
      return
    }

    // Check if items have actually changed to avoid infinite loops
    const itemsJSON = JSON.stringify(items)
    const previousItemsJSON = JSON.stringify(previousItemsRef.current)

    if (itemsJSON !== previousItemsJSON) {
      // Update the ref with current items
      previousItemsRef.current = JSON.parse(itemsJSON)

      // Only sync if there are items
      if (items.length > 0) {
        const timeoutId = setTimeout(() => {
          dispatch(syncCart(items))
        }, 1000) // Debounce for 1 second

        return () => clearTimeout(timeoutId)
      }
    }
  }, [dispatch, items, initialized, syncing])

  return <>{children}</>
}

export default CartProvider
