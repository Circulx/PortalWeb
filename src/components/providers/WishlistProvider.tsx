"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useWishlistSync } from "@/hooks/useWishlistSync"

interface WishlistProviderProps {
  children: React.ReactNode
}

export default function WishlistProvider({ children }: WishlistProviderProps) {
  const { initWishlist } = useWishlistSync()
  const initRef = useRef(false)

  // Initialize wishlist on component mount - only runs once
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    initWishlist()
  }, [initWishlist])

  return <>{children}</>
}
