"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
}

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

  // Create slides from advertisements only
  const slides = advertisements.map((ad) => ({
    id: ad._id,
    title: ad.title,
    subtitle: ad.subtitle,
    description: ad.description,
    image: ad.imageUrl,
    linkUrl: ad.linkUrl,
  }))

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 2000) // 2 seconds per slide

    return () => clearInterval(timer)
  }, [slides.length])

  const handleImageError = (slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }))
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
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

  // Show error state
  if (error) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-red-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-red-500">Error loading advertisements: {error}</div>
        </div>
      </div>
    )
  }

  // Don't render anything if no advertisements
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gray-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-gray-500">No active advertisements available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
      {slides.map((slide, index) => {
        const SlideContent = () => (
          <div
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="container mx-auto px-4 h-full flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2 text-center sm:text-left mb-4 sm:mb-0 z-10">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-800">{slide.title}</h2>
                <div className="text-3xl sm:text-6xl lg:text-7xl font-bold mb-4 text-primary">{slide.subtitle}</div>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600">👍 {slide.description}</p>
              </div>
              <div className="w-full sm:w-1/2 relative">
                {!imageErrors[slide.id] ? (
                  <Image
                    src={slide.image || "/placeholder.svg?height=400&width=800&query=advertisement"}
                    alt={slide.title}
                    width={800}
                    height={400}
                    className="object-contain w-full h-auto max-h-[250px] sm:max-h-[350px]"
                    onError={() => handleImageError(slide.id)}
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-[250px] sm:h-[350px] bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Image not available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

        return slide.linkUrl ? (
          <Link key={slide.id} href={slide.linkUrl} className="block">
            <SlideContent />
          </Link>
        ) : (
          <div key={slide.id}>
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
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                currentSlide === index ? "bg-primary" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows for larger screens */}
      {slides.length > 1 && (
        <div className="hidden sm:block">
          <button
            onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-colors duration-200 z-20"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goToSlide((currentSlide + 1) % slides.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-colors duration-200 z-20"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
          <div
            className="h-full bg-primary transition-all duration-2000 ease-linear"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}
