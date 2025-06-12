"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
}

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
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // Get device type for responsive ads
  const getDeviceType = () => {
    if (typeof window === "undefined") return "desktop"

    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }

  const fetchAdvertisements = async () => {
    try {
      setLoading(true)
      setError(null)

      const deviceType = getDeviceType()
      console.log("Fetching advertisements for device type:", deviceType)

      const response = await fetch(`/api/advertisements/active?deviceType=${deviceType}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("API Response:", result)

      if (result.success) {
        setAdvertisements(result.data || [])
        console.log("Set advertisements:", result.data?.length || 0)
      } else {
        console.error("API returned error:", result.error)
        setError(result.error || "Failed to fetch advertisements")
        setAdvertisements([])
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch advertisements")
      setAdvertisements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvertisements()

    // Refetch on window resize to get appropriate device type
    const handleResize = () => {
      fetchAdvertisements()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Get image source - prioritize imageData (base64) over imageUrl
  const getImageSource = (ad: Advertisement) => {
    if (ad.imageData) return ad.imageData
    if (ad.imageUrl) return ad.imageUrl
    return "/placeholder.svg?height=400&width=1200"
  }

  // Create slides from advertisements or use default slides if no active ads
  const slides =
    advertisements.length > 0
      ? advertisements.map((ad) => ({
          id: ad._id,
          title: ad.title,
          subtitle: ad.subtitle,
          description: ad.description,
          image: getImageSource(ad),
          linkUrl: ad.linkUrl,
        }))
      : defaultSlides

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000) // 5 seconds per slide

    return () => clearInterval(timer)
  }, [slides.length])

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }))
    console.error(`Image error for slide ${slideId}`)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Check if a slide has content (title, subtitle, or description)
  const hasContent = (slide: (typeof slides)[0]) => {
    return slide.title || slide.subtitle || slide.description
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gray-100 animate-pulse">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-gray-400">Loading advertisements...</div>
        </div>
      </div>
    )
  }

  // Always show slides (either from database or default)
  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Show indicator if using default slides */}
      {advertisements.length === 0 && !loading && (
        <div className="absolute top-2 right-2 z-30 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          Sample Ads
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
                slide.image && slide.image.startsWith("http") && !slide.image.startsWith(window.location.origin) ? (
                  <img
                    src={slide.image || "/placeholder.svg"}
                    alt={slide.title || "Advertisement"}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(slide.id)}
                  />
                ) : (
                  <Image
                    src={slide.image || "/placeholder.svg?height=400&width=1200&query=industrial%20equipment"}
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

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault()
              goToSlide((currentSlide - 1 + slides.length) % slides.length)
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors duration-300 z-20 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              goToSlide((currentSlide + 1) % slides.length)
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors duration-300 z-20 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ArrowRight className="w-4 h-4" />
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
