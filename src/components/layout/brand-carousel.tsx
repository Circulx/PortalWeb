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
    <div className="w-full py-6">
      <h2 className="text-2xl font-bold text-center mb-2">Top Brand & Categories</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex justify-center space-x-4 p-4">
          {visibleBrands.map((brand, i) => (
            <Link
              key={`${brand.name}-${i}`}
              href={brand.href}
              className="w-[80px] sm:w-[100px] flex-none rounded-full bg-gray-100 p-3 sm:p-4 hover:bg-gray-200 transition-colors"
            >
              <div className="aspect-square relative">
                <Image src={brand.logo} alt={`${brand.name} logo`} fill className="object-contain p-1 sm:p-2" />
              </div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
