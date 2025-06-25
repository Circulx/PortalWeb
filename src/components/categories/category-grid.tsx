"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Package } from "lucide-react"

interface Category {
  name: string
  count: number
  sampleImage: string
  avgPrice: number
  subcategories: string[]
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const CATEGORIES_PER_PAGE = 7
  const AUTO_SCROLL_INTERVAL = 5000 // 10 seconds

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (categories.length <= CATEGORIES_PER_PAGE) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move one category at a time, creating infinite loop
        return (prevIndex + 1) % categories.length
      })
    }, AUTO_SCROLL_INTERVAL)

    return () => clearInterval(interval)
  }, [categories.length])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories")
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-900" />
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 mb-4">Error loading categories</div>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No categories found</p>
      </div>
    )
  }

  // Get current visible categories with infinite loop
  const getVisibleCategories = () => {
    const visibleCategories = []
    for (let i = 0; i < CATEGORIES_PER_PAGE; i++) {
      const categoryIndex = (currentIndex + i) % categories.length
      visibleCategories.push({
        ...categories[categoryIndex],
        key: `${categories[categoryIndex].name}-${currentIndex}-${i}`,
      })
    }
    return visibleCategories
  }

  const visibleCategories = getVisibleCategories()

  return (
    <section className="py-16 bg-gray">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Shop by Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our wide range of products organized by categories to help you find exactly what you need
          </p>
        </div>

        {/* Categories Grid with Auto-scroll */}
        <div className="w-[95%] mx-auto overflow-hidden">
          <div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4 md:gap-6 transition-all duration-1000 ease-in-out"
            style={{
              transform: categories.length > CATEGORIES_PER_PAGE ? "translateX(0)" : "none",
            }}
          >
            {visibleCategories.map((category, index) => (
              <Link key={category.key} href={`/categories/${encodeURIComponent(category.name)}`} className="group">
                <div className="flex flex-col items-center text-center transition-all duration-300 hover:scale-105">
                  {/* Circular Image Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 mb-3 md:mb-4 rounded-full overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-300 border-2 border-gray-300 group-hover:border-green-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-green-50 group-hover:to-green-100 transition-all duration-300" />
                    <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-3 md:p-4">
                      <Image
                        src={category.sampleImage || "/placeholder.svg?height=80&width=80"}
                        alt={category.name}
                        width={80}
                        height={80}
                        className="object-contain transition-all duration-300 group-hover:scale-110 w-full h-full"
                        sizes="(min-width: 1280px) 128px, (min-width: 1024px) 112px, (min-width: 768px) 96px, (min-width: 640px) 80px, 64px"
                      />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-green-900 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-full" />
                  </div>

                  {/* Category Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 group-hover:text-green-900 transition-colors duration-300 leading-tight text-center px-1">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 group-hover:text-green-700 transition-colors duration-300">
                      {category.count} products
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Auto-scroll indicator */}
        {categories.length > CATEGORIES_PER_PAGE && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(categories.length, 10) }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex % Math.min(categories.length, 10) ? "bg-green-900 w-4" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
