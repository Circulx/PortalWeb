"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface FeaturedCategory {
  id: string
  name: string
  image: string
  href: string
  description?: string
}

const featuredCategories: FeaturedCategory[] = [
  {
    id: "power-tools",
    name: "POWER TOOLS",
    image: "/powertools.jpeg",
    href: "/products?category=power-tools",
    description: "Professional grade power tools for every job",
  },
  {
    id: "electricals",
    name: "ELECTRICALS",
    image: "/electrical.jpeg",
    href: "/products?category=electricals",
    description: "Complete electrical solutions and components",
  },
  {
    id: "appliances-utilities",
    name: "APPLIANCES AND UTILITIES",
    image: "/appliances.jpeg",
    href: "/products?category=appliances-utilities",
    description: "Home and commercial appliances",
  },
  {
    id: "safety",
    name: "SAFETY",
    image: "/safety.jpeg",
    href: "/products?category=safety",
    description: "Safety equipment and protective gear",
  },
  {
    id: "office-stationary",
    name: "OFFICE STATIONARY",
    image: "/security.jpeg",
    href: "/products?category=office-stationary",
    description: "Complete office supplies and equipment",
  },
  {
    id: "security",
    name: "SECURITY",
    image: "/security.jpeg",
    href: "/products?category=security",
    description: "Security systems and surveillance equipment",
  },
]

function FeaturedCategoryCard({ category }: { category: FeaturedCategory }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Link
      href={category.href}
      className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-[5/4] block transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageError ? "/placeholder.svg?height=250&width=300" : category.image}
          alt={category.name}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Loading skeleton */}
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="text-white font-bold text-xs sm:text-sm md:text-base mb-1 group-hover:text-white transition-colors duration-300 leading-tight">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-lg transition-all duration-300" />
    </Link>
  )
}

function FeaturedCategoriesSkeleton() {
  return (
    <section className="w-full px-4 py-6 sm:py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-64 sm:w-80 mx-auto animate-pulse mb-3" />
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-80 sm:w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="aspect-[5/4] bg-gray-200 rounded-lg animate-pulse" />
            ))}
        </div>
      </div>
    </section>
  )
}

export default function FeaturedCategories() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <FeaturedCategoriesSkeleton />
  }

  return (
    <section className="w-full px-4 py-6 sm:py-8 bg-gray">
      <div className="max-w-7xl mx-auto">
        

        {/* Categories Grid - 3 columns, 2 rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {featuredCategories.map((category) => (
            <FeaturedCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
