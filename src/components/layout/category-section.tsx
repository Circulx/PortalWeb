"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface Category {
  id: string
  name: string
  image: string
  href: string
}

const categories: Category[] = [
  {
    id: "power-tools",
    name: "Power Tools",
    image: "/powertools.jpeg",
    href: "/products?category=power-tools",
  },
  {
    id: "safety",
    name: "Safety",
    image: "/safety.jpeg",
    href: "/products?category=safety",
  },
  {
    id: "appliances",
    name: "Appliances",
    image: "/appliances.jpeg",
    href: "/products?category=appliances",
  },
  
  {
    id: "electricals",
    name: "Electricals",
    image: "/electrical.jpeg",
    href: "/products?category=electricals",
  },
  {
    id: "electricals",
    name: "Electricals",
    image: "/electrical.jpeg",
    href: "/products?category=electricals",
  },
  {
    id: "security",
    name: "Security",
    image: "/security.jpeg",
    href: "/products?category=security",
  },
]

function CategoryCard({ category }: { category: Category }) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={category.href}
      className="group flex flex-col items-center p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-3 overflow-hidden rounded-full bg-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <Image
          src={imageError ? "/placeholder.svg?height=120&width=120" : category.image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-full" />
      </div>
      <h3 className="text-sm sm:text-base font-medium text-gray-800 text-center group-hover:text-gray-900 transition-colors duration-300">
        {category.name}
      </h3>
    </Link>
  )
}

export default function CategorySection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="w-full px-4 py-4 sm:py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex flex-col items-center p-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gray-200 rounded-full animate-pulse mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full px-4 py-4 sm:py-6 bg-gray">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Shop by Categories</h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Discover our wide range of products organized by categories to help you find exactly what you need
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* View All Categories Link - Commented out as requested
  <div className="text-center mt-8 sm:mt-12">
    <Link
      href="/products"
      className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-md hover:shadow-lg"
    >
      View All Categories
      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
  */}
      </div>
    </section>
  )
}
