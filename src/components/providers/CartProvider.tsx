"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setCartFromDb } from "@/store/slices/cartSlice"
import axios from "axios"
import { getCurrentUser } from "@/actions/auth"
import type { AppDispatch } from "@/store"

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const initializeCart = async () => {
      if (isLoading) return

      try {
        setIsLoading(true)

        const user = await getCurrentUser()
        const userId = user?.id || null

        if (userId === currentUserId) {
          setIsLoading(false)
          return
        }

        setCurrentUserId(userId)

        if (!user) {
          // If no user, clear cart
          dispatch(setCartFromDb([]))
          return
        }

        console.log("CartProvider: Initializing cart from database...")
        const response = await axios.get("/api/cart")
        const dbItems = response.data.items || []

        // Update Redux state with items from database
        dispatch(setCartFromDb(dbItems))
      } catch (error) {
        console.error("CartProvider: Error initializing cart:", error)
        dispatch(setCartFromDb([]))
      } finally {
        setIsLoading(false)
      }
    }

    initializeCart()

    const interval = setInterval(initializeCart, 500)

    return () => clearInterval(interval)
  }, [dispatch, currentUserId, isLoading])

  return <>{children}</>
}
