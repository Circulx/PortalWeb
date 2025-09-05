"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAdvertisements, type Advertisement } from "@/store/slices/advertisementSlice"
import type { AppDispatch, RootState } from "@/store"

// Skeleton loading component for better UX
const SliderSkeleton = () => (
  <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-blue-600 text-sm">Loading advertisements...</p>
      </div>
    </div>
  </div>
)

export default function SimpleSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [deviceType, setDeviceType] = useState<string>("desktop")
  const [isInitializing, setIsInitializing] = useState(true)

  const dispatch = useDispatch<AppDispatch>()
  const { advertisements, status, error, isInitialized } = useSelector((state: RootState) => state.advertisements)

  useEffect(() => {
    console.log("SimpleSlider Debug:", {
      advertisementsCount: advertisements.length,
      status,
      isInitialized,
      advertisements: advertisements.map((ad) => ({ id: ad._id, title: ad.title })),
    })
  }, [advertisements, status, isInitialized])

  // Optimized device type detection with memoization
  const getDeviceType = useCallback(() => {
    if (typeof window === "undefined") return "desktop"
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }, [])

  // Optimized image source getter with caching
  const getImageSource = useCallback((ad: Advertisement) => {
    if (ad.imageData) return ad.imageData
    if (ad.imageUrl) return ad.imageUrl
    return "/placeholder.svg?height=400&width=1200"
  }, [])

  const slides = useMemo(() => {
    console.log("Creating slides - advertisements count:", advertisements.length)

    // Filter advertisements for homepage position
    const homepageAds = advertisements.filter(ad => 
      ad.isActive && 
      ad.position === "homepage" &&
      (ad.deviceType === deviceType || ad.deviceType === "all")
    )

    console.log("Homepage filtered ads:", homepageAds.length)

    // Only show actual advertisements from database, no default slides
    if (homepageAds.length > 0) {
      const dbSlides = homepageAds.map((ad) => ({
        id: ad._id,
        title: ad.title,
        subtitle: ad.subtitle,
        description: ad.description,
        image: getImageSource(ad),
        linkUrl: ad.linkUrl,
      }))
      console.log("Using database slides:", dbSlides)
      return dbSlides
    }

    // Return empty array instead of default slides
    console.log("No homepage advertisements available, showing empty slider")
    return []
  }, [advertisements, getImageSource, deviceType])

  useEffect(() => {
    const initialDeviceType = getDeviceType()
    setDeviceType(initialDeviceType)

    console.log("Fetching advertisements for device type:", initialDeviceType)
    dispatch(fetchAdvertisements({ deviceType: initialDeviceType, position: "homepage" }))
      .finally(() => {
        setIsInitializing(false)
      })
  }, [dispatch, getDeviceType])

  useEffect(() => {
    const handleResize = () => {
      const newDeviceType = getDeviceType()
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType)
        console.log("Device type changed, fetching for:", newDeviceType)
        dispatch(fetchAdvertisements({ deviceType: newDeviceType, position: "homepage" }))
      }
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [dispatch, deviceType, getDeviceType])

  // Optimized auto-slide with better performance
  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides.length])

  const handleImageError = useCallback((slideId: string) => {
    setImageErrors((prev) => ({ ...prev, [slideId]: true }))
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const hasContent = useCallback((slide: (typeof slides)[0]) => {
    return slide.title || slide.subtitle || slide.description
  }, [])

  // Show skeleton while initializing
  if (isInitializing) {
    return <SliderSkeleton />
  }

  // Show skeleton while loading and no cached data
  if (status === "loading" && advertisements.length === 0 && !isInitialized) {
    return <SliderSkeleton />
  }

  if (status === "failed" && advertisements.length === 0) {
    console.warn("Failed to load advertisements:", error)
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600 text-sm">No advertisements available</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if no advertisements are available
  if (slides.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
      {slides.map((slide, index) => {
        const hasSlideContent = hasContent(slide)
        const isCurrentSlide = index === currentSlide

        const SlideContent = () => (
          <div
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
              isCurrentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Optimized image container */}
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
                    decoding={index === 0 ? "sync" : "async"}
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
                    quality={index === 0 ? 85 : 70}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                )
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image not available</span>
                </div>
              )}

              {/* Optimized gradient overlay */}
              {hasSlideContent && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent sm:from-black/60 sm:via-black/40" />
              )}
            </div>

            {/* Optimized content container */}
            <div className="relative h-full container mx-auto px-4 flex items-center">
              {hasSlideContent && (
                <div className="w-full sm:w-2/3 md:w-1/2 lg:w-2/5 text-left z-10 p-4 md:p-6 rounded-lg bg-white/10 backdrop-blur-sm">
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

        return (
          <div key={slide.id} className="h-full">
            {slide.linkUrl ? (
              <Link href={slide.linkUrl}>
                <SlideContent />
              </Link>
            ) : (
              <SlideContent />
            )}
          </div>
        )
        // Now only the "Explore Now" button inside SlideContent is clickable, which is better UX
      })}

      {/* Optimized navigation dots */}
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

      {/* Optimized navigation arrows */}
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

      {/* Optimized progress bar */}
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
