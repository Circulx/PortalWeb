"use client"

import { useDispatch, useSelector } from "react-redux"
import {
  addItem as addItemAction,
  removeItem as removeItemAction,
  increaseQuantity as increaseQuantityAction,
  decreaseQuantity as decreaseQuantityAction,
  clearCart as clearCartAction,
} from "@/store/slices/cartSlice"
import type { RootState } from "@/store"
import { useCallback, useEffect, useRef } from "react"
import axios from "axios"
import { getCurrentUser } from "@/actions/auth"

export function useCartSync() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const previousItemsRef = useRef<any[]>([])
  const syncInProgressRef = useRef(false)

  // Sync cart with database when it changes
  useEffect(() => {
    // Skip if sync is already in progress
    if (syncInProgressRef.current) {
      return
    }

    // Check if items have actually changed to avoid infinite loops
    const itemsJSON = JSON.stringify(cartItems)
    const previousItemsJSON = JSON.stringify(previousItemsRef.current)

    if (itemsJSON !== previousItemsJSON) {
      // Update the ref with current items
      previousItemsRef.current = JSON.parse(itemsJSON)

      const syncCartWithDatabase = async () => {
        try {
          syncInProgressRef.current = true
          const user = await getCurrentUser()
          if (user) {
            await axios.post("/api/cart", { items: cartItems })
          }
        } catch (error) {
          console.error("Error syncing cart with database:", error)
        } finally {
          syncInProgressRef.current = false
        }
      }

      // Use a debounce to avoid too many requests
      const debounceTimeout = setTimeout(syncCartWithDatabase, 500)
      return () => clearTimeout(debounceTimeout)
    }
  }, [cartItems])

  // Add item to cart
  const addItem = useCallback(
    (payload: any) => {
      dispatch(addItemAction(payload))
    },
    [dispatch],
  )

  // Remove item from cart
  const removeItem = useCallback(
    (id: string) => {
      dispatch(removeItemAction(id))
    },
    [dispatch],
  )

  // Increase quantity
  const increaseQuantity = useCallback(
    (id: string) => {
      dispatch(increaseQuantityAction(id))
    },
    [dispatch],
  )

  // Decrease quantity
  const decreaseQuantity = useCallback(
    (id: string) => {
      dispatch(decreaseQuantityAction(id))
    },
    [dispatch],
  )

  // Clear cart
  const clearCart = useCallback(() => {
    dispatch(clearCartAction())
  }, [dispatch])

  return {
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  }
}
