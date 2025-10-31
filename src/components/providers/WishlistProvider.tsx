"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { fetchWishlist } from "@/store/slices/wishlistSlice"
import { getCurrentUser } from "@/actions/auth"
import type { AppDispatch } from "@/store"

interface WishlistProviderProps {
  children: React.ReactNode
}

export default function WishlistProvider({ children }: WishlistProviderProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const initializeWishlist = async () => {
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

        if (user) {
          await dispatch(fetchWishlist()).unwrap()
        }
      } catch (error) {
        console.error("WishlistProvider: Error initializing wishlist:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeWishlist()

    const interval = setInterval(initializeWishlist, 500)

    return () => clearInterval(interval)
  }, [dispatch, currentUserId, isLoading])

  return <>{children}</>
}
