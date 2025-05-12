"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useDispatch } from "react-redux"
import { setCartFromDb } from "@/store/slices/cartSlice"
import axios from "axios"
import { getCurrentUser } from "@/actions/auth"
import type { AppDispatch } from "@/store"

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    const initializeCart = async () => {
      // Only initialize once
      if (initialized.current || isLoading) return

      try {
        setIsLoading(true)
        initialized.current = true

        const user = await getCurrentUser()
        if (!user) return

        console.log("CartProvider: Initializing cart from database...")
        const response = await axios.get("/api/cart")
        const dbItems = response.data.items || []

        // Update Redux state with items from database
        dispatch(setCartFromDb(dbItems))
      } catch (error) {
        console.error("CartProvider: Error initializing cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeCart()
  }, [dispatch])

  return <>{children}</>
}
