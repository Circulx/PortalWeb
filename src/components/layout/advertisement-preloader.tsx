"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { fetchAdvertisements } from "@/store/slices/advertisementSlice"
import type { AppDispatch } from "@/store"

export default function AdvertisementPreloader() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const preloadAdvertisements = async () => {
      try {
        // Detect device type
        let deviceType = "desktop"
        if (typeof window !== "undefined") {
          const width = window.innerWidth
          if (width < 768) deviceType = "mobile"
          else if (width < 1024) deviceType = "tablet"
        }

        console.log("[v0] Preloader: Starting advertisement preload for device:", deviceType)

        // Preload advertisements for all positions
        const result = await dispatch(fetchAdvertisements({ deviceType })).unwrap()
        console.log("[v0] Preloader: Advertisements preloaded successfully:", result)
      } catch (error) {
        console.warn("[v0] Preloader: Failed to preload advertisements:", error)

        setTimeout(async () => {
          try {
            console.log("[v0] Preloader: Retrying advertisement preload")
            await dispatch(fetchAdvertisements({ deviceType: "all" })).unwrap()
            console.log("[v0] Preloader: Retry successful")
          } catch (retryError) {
            console.error("[v0] Preloader: Retry failed:", retryError)
          }
        }, 2000)
      }
    }

    // Start preloading immediately
    preloadAdvertisements()

    const preloadOtherDeviceTypes = async () => {
      const deviceTypes = ["mobile", "tablet", "desktop"]
      for (const type of deviceTypes) {
        try {
          await dispatch(fetchAdvertisements({ deviceType: type }))
          console.log(`[v0] Preloader: Preloaded for ${type}`)
        } catch (error) {
          console.warn(`[v0] Preloader: Failed to preload for ${type}:`, error)
        }
      }
    }

    // Preload other device types after a delay
    const timeoutId = setTimeout(preloadOtherDeviceTypes, 3000)

    return () => clearTimeout(timeoutId)
  }, [dispatch])

  // This component doesn't render anything visible
  return null
}
