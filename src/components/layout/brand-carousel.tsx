"use client"

import React, { useState, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const allBrands = [
  { name: "Canon", logo: "/audi.jpeg", href: "/brands/canon" },
  { name: "Audi", logo: "/download.png", href: "/brands/audi" },
  { name: "Tata", logo: "/download (1).png", href: "/brands/tata" },
  { name: "Royal", logo: "/download.png", href: "/brands/royal" },
  { name: "Hyundai", logo: "/audi.jpeg", href: "/brands/hyundai" },
  { name: "BMW", logo: "/download.png", href: "/brands/bmw" },
  { name: "Mercedes", logo: "/download (1).png", href: "/brands/mercedes" },
  { name: "Toyota", logo: "/download.png", href: "/brands/toyota" },
  { name: "Honda", logo: "/audi.jpeg", href: "/brands/honda" },
  { name: "Ford", logo: "/download.png", href: "/brands/ford" },
  { name: "Chevrolet", logo: "/download (1).png", href: "/brands/chevrolet" },
  { name: "Nissan", logo: "/download.png", href: "/brands/nissan" },
]

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

function BrandCard({ brand }: { brand: { name: string; logo: string; href: string } }) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={brand.href}
      className="group flex flex-col items-center p-4 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mb-3 overflow-hidden rounded-full bg-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <Image
          src={imageError ? "/placeholder.svg?height=120&width=120" : brand.logo}
          alt={`${brand.name} logo`}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-110 p-1 sm:p-2"
          onError={() => setImageError(true)}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-full" />
      </div>
      <h3 className="text-sm sm:text-base font-medium text-gray-800 text-center group-hover:text-gray-900 transition-colors duration-300">
        {brand.name}
      </h3>
    </Link>
  )
}

export function BrandCarousel() {
  const [visibleBrands, setVisibleBrands] = useState(allBrands.slice(0, 6))
  const [currentIndex, setCurrentIndex] = useState(0)

  const updateBrands = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % allBrands.length
      setVisibleBrands((prevBrands) => {
        const newBrands = [...prevBrands]
        newBrands.shift() // Remove the first brand
        newBrands.push(allBrands[(nextIndex + 5) % allBrands.length]) // Add the next brand
        return newBrands
      })
      return nextIndex
    })
  }, [])

  useInterval(updateBrands, 15000)

  return (
    <section className="w-full px-4 py-4 sm:py-6 bg-gray">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Trending Brands</h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Discover products from the most trusted and popular brands in the market
          </p>
        </div>

        {/* Brands Grid */}
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
          <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8 p-4">
            {visibleBrands.map((brand, i) => (
              <div key={`${brand.name}-${i}`} className="flex-none">
                <BrandCard brand={brand} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  )
}
