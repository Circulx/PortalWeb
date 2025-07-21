"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAdvertisements, markAsInitialized, type Advertisement } from "@/store/slices/advertisementSlice"
import type { AppDispatch, RootState } from "@/store"

// Default sample advertisements to show when no active ads are available
const defaultSlides = [
  {
    id: "default-1",
    title: "Delivery Within",
    subtitle: "24 HOURS",
    description: "At No Extra Cost",
    image: "/placeholder.svg?height=400&width=1200",
    linkUrl: "/products",
  },
  {
    id: "default-2",
    title: "Special Offers",
    subtitle: "UP TO 50% OFF",
    description: "Limited Time Only",
    image: "/placeholder.svg?height=400&width=1200",
    linkUrl: "/products",
  },
  {
    id: "default-3",
    title: "New Arrivals",
    subtitle: "SHOP NOW",
    description: "Fresh Stock Available",
    image: "/placeholder.svg?height=400&width=1200",
    linkUrl: "/products",
  },
]

export default function SimpleSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [deviceType, setDeviceType] = useState<string>("desktop")
  const [hasInitialized, setHasInitialized] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { advertisements, status, error, isInitialized } = useSelector((state: RootState) => state.advertisements)

  // Memoized device type detection
  const getDeviceType = useCallback(() => {
    if (typeof window === "undefined") return "desktop"
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }, [])

  // Memoized image source getter
  const getImageSource = useCallback((ad: Advertisement) => {
    if (ad.imageData) return ad.imageData
    if (ad.imageUrl) return ad.imageUrl
    return "/placeholder.svg?height=400&width=1200"
  }, [])

  // Memoized slides creation
  const slides = useMemo(() => {
    return advertisements.length > 0
      ? advertisements.map((ad) => ({
          id: ad._id,
          title: ad.title,
          subtitle: ad.subtitle,
          description: ad.description,
          image: getImageSource(ad),
          linkUrl: ad.linkUrl,
        }))
      : defaultSlides
  }, [advertisements, getImageSource])

  // Initialize device type and fetch advertisements only once
  useEffect(() => {
    if (hasInitialized) return

    const initialDeviceType = getDeviceType()
    setDeviceType(initialDeviceType)
    setHasInitialized(true)

    // Only fetch if not already initialized or if we don't have data
    if (!isInitialized || advertisements.length === 0) {
      console.log("Initializing advertisements for device type:", initialDeviceType)
      dispatch(fetchAdvertisements(initialDeviceType))
    } else {
      console.log("Using existing advertisement data")
      dispatch(markAsInitialized())
    }
  }, [dispatch, getDeviceType, hasInitialized, isInitialized, advertisements.length])

  // Handle device type changes (resize) with debouncing
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const newDeviceType = getDeviceType()
        if (newDeviceType !== deviceType) {
          console.log("Device type changed from", deviceType, "to", newDeviceType)
          setDeviceType(newDeviceType)
          // Only fetch if device type actually changed and we don't have recent data
          dispatch(fetchAdvertisements(newDeviceType))
        }
      }, 250) // Debounce resize events
    }

    if (hasInitialized) {
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
        clearTimeout(resizeTimeout)
      }
    }
  }, [dispatch, deviceType, getDeviceType, hasInitialized])

  // Auto-slide functionality
  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000) // 5 seconds per slide

    return () => clearInterval(timer)
  }, [slides.length])

  const handleImageError = useCallback((slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }))
    console.error(`Image error for slide ${slideId}`)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  // Check if a slide has content (title, subtitle, or description)
  const hasContent = useCallback((slide: (typeof slides)[0]) => {
    return slide.title || slide.subtitle || slide.description
  }, [])

  // Show loading state only for initial load and when no cached data exists
  if (status === "loading" && !isInitialized && advertisements.length === 0) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-blue-600 font-medium"></p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state with fallback to default slides only if no cached data
  if (status === "failed" && advertisements.length === 0) {
    console.warn("Failed to load advertisements, using default slides:", error)
  }

  // Always show slides (either from database or default)
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Show indicator if using default slides */}
      {advertisements.length === 0 && status !== "loading" && (
        <div className="absolute top-2 right-2 z-30 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          Demo Mode
        </div>
      )}

      {slides.map((slide, index) => {
        const hasSlideContent = hasContent(slide)

        const SlideContent = () => (
          <div
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Full-width image container with responsive sizing */}
            <div className="absolute inset-0 w-full h-full">
              {!imageErrors[slide.id] ? (
                slide.image &&
                slide.image.startsWith("http") &&
                typeof window !== "undefined" &&
                !slide.image.startsWith(window.location.origin) ? (
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title || "Advertisement"}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(slide.id)}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ) : (
                  <Image
                    src={slide.image || "/placeholder.svg?height=400&width=1200"}
                    alt={slide.title || "Advertisement"}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(slide.id)}
                    priority={index === 0}
                    unoptimized={slide.image?.startsWith("data:")}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}

              {/* Responsive gradient overlay for text readability */}
              {hasSlideContent && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent sm:from-black/60 sm:via-black/40" />
              )}
            </div>

            {/* Content container with responsive positioning */}
            <div className="relative h-full container mx-auto px-4 flex items-center">
              {hasSlideContent && (
                <div
                  className={`w-full sm:w-2/3 md:w-1/2 lg:w-2/5 text-left z-10 p-4 md:p-6 rounded-lg 
                    ${hasSlideContent ? "bg-white/10 backdrop-blur-sm" : ""}`}
                >
                  {slide.title && (
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-white drop-shadow-md">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white drop-shadow-lg">
                      {slide.subtitle}
                    </div>
                  )}
                  {slide.description && (
                    <p className="text-base sm:text-lg text-white/90 drop-shadow-md mb-4">{slide.description}</p>
                  )}

                  {slide.linkUrl && (
                    <div className="mt-4">
                      <Link
                        href={slide.linkUrl}
                        className="inline-flex items-center px-4 py-2 bg-white text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors duration-300 text-sm"
                      >
                        Explore Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

        return slide.linkUrl ? (
          <Link key={slide.id} href={slide.linkUrl} className="block h-full">
            <SlideContent />
          </Link>
        ) : (
          <div key={slide.id} className="h-full">
            <SlideContent />
          </div>
        )
      })}

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                currentSlide === index ? "bg-white" : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Small Navigation Indicators */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              goToSlide((currentSlide - 1 + slides.length) % slides.length)
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 z-20 backdrop-blur-sm flex items-center justify-center group"
            aria-label="Previous slide"
          >
            <div className="w-2 h-2 border-l-2 border-b-2 border-white transform rotate-45 group-hover:scale-110 transition-transform"></div>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              goToSlide((currentSlide + 1) % slides.length)
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full transition-all duration-300 z-20 backdrop-blur-sm flex items-center justify-center group"
            aria-label="Next slide"
          >
            <div className="w-2 h-2 border-r-2 border-t-2 border-white transform rotate-45 group-hover:scale-110 transition-transform"></div>
          </button>
        </>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-500 ease-linear"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}
