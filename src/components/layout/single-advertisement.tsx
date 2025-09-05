"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Advertisement } from "@/store/slices/advertisementSlice"

interface SingleAdvertisementProps {
  position?: "homepage" | "category" | "bottomofhomepage"
  className?: string
  deviceType?: "desktop" | "mobile" | "tablet" | "all"
}

export default function SingleAdvertisement({ 
  position = "homepage",
  className = "",
  deviceType
}: SingleAdvertisementProps) {
  const [imageError, setImageError] = useState(false)
  const [currentDeviceType, setCurrentDeviceType] = useState<string>("desktop")
  
  const { advertisements, status } = useSelector((state: RootState) => state.advertisements)
  
  // Determine device type
  useEffect(() => {
    if (deviceType) {
      setCurrentDeviceType(deviceType)
    } else if (typeof window !== "undefined") {
      const width = window.innerWidth
      if (width < 768) setCurrentDeviceType("mobile")
      else if (width < 1024) setCurrentDeviceType("tablet")
      else setCurrentDeviceType("desktop")
    }
  }, [deviceType])

  // Filter advertisements for the current device type and position
  const filteredAds = advertisements.filter(ad => 
    ad.isActive && 
    (ad.deviceType === currentDeviceType || ad.deviceType === "all") &&
    (ad.position === position || ad.position === "all")
  )

  // Get the first available advertisement (no slides, just one ad)
  const currentAd = filteredAds[0]

  // Don't render if no ads or not loaded
  if (filteredAds.length === 0 || status !== "succeeded" || !currentAd) {
    return null
  }

  // Get image source with fallback
  const getImageSource = () => {
    if (currentAd.imageData) return currentAd.imageData
    if (currentAd.imageUrl) return currentAd.imageUrl
    return "/placeholder.svg?height=200&width=800"
  }

  const imageSource = getImageSource()

  // Determine styling based on position
  const getPositionStyles = () => {
    switch (position) {
      case "homepage":
        return "w-full h-[200px] bg-gradient-to-r from-blue-50 to-blue-100"
      case "category":
        return "w-full h-[150px] bg-gradient-to-r from-green-50 to-green-100"
      case "bottomofhomepage":
        return "w-full h-[250px] bg-gradient-to-r from-purple-50 to-purple-100"
      default:
        return "w-full h-[200px] bg-gradient-to-r from-gray-50 to-gray-100"
    }
  }

  const getBorderStyles = () => {
    switch (position) {
      case "homepage":
        return "border-blue-200"
      case "category":
        return "border-green-200"
      case "bottomofhomepage":
        return "border-purple-200"
      default:
        return "border-gray-200"
    }
  }

  return (
    <div className={`relative w-full mb-6 ${className}`}>
      {/* Advertisement Container */}
      <div className={`relative ${getPositionStyles()} rounded-lg overflow-hidden border ${getBorderStyles()} shadow-sm`}>
        {/* Advertisement Content */}
        <div className="relative w-full h-full">
          {currentAd.linkUrl ? (
            <Link href={currentAd.linkUrl} className="block w-full h-full">
              <div className="relative w-full h-full">
                {!imageError ? (
                  imageSource.startsWith("http") && typeof window !== "undefined" && !imageSource.startsWith(window.location.origin) ? (
                    <img
                      src={imageSource}
                      alt={currentAd.title || "Advertisement"}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  ) : (
                    <Image
                      src={imageSource}
                      alt={currentAd.title || "Advertisement"}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      priority={false}
                      unoptimized={imageSource.startsWith("data:")}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                      quality={80}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5drrMNN91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Image not available</span>
                  </div>
                )}

                {/* Content overlay */}
                {(currentAd.title || currentAd.subtitle || currentAd.description) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                )}

                {/* Text content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="px-6 text-white">
                    {currentAd.title && (
                      <h3 className="text-xl font-bold mb-2">{currentAd.title}</h3>
                    )}
                    {currentAd.subtitle && (
                      <p className="text-lg mb-2 opacity-90">{currentAd.subtitle}</p>
                    )}
                    {currentAd.description && (
                      <p className="text-sm opacity-80 line-clamp-2">{currentAd.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative w-full h-full">
              {!imageError ? (
                imageSource.startsWith("http") && typeof window !== "undefined" && !imageSource.startsWith(window.location.origin) ? (
                  <img
                    src={imageSource}
                    alt={currentAd.title || "Advertisement"}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src={imageSource}
                    alt={currentAd.title || "Advertisement"}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    priority={false}
                    unoptimized={imageSource.startsWith("data:")}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                    quality={80}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5drrMNN91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}

              {/* Content overlay */}
              {(currentAd.title || currentAd.subtitle || currentAd.description) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              )}

              {/* Text content */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 text-white">
                  {currentAd.title && (
                    <h3 className="text-xl font-bold mb-2">{currentAd.title}</h3>
                  )}
                  {currentAd.subtitle && (
                    <p className="text-lg mb-2 opacity-90">{currentAd.subtitle}</p>
                  )}
                  {currentAd.description && (
                    <p className="text-sm opacity-80 line-clamp-2">{currentAd.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ad label */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Advertisement
        </span>
      </div>
    </div>
  )
}
