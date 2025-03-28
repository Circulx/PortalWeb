"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Building2, MapPin, ShoppingCart, Star } from "lucide-react"

interface ProductCardProps {
  title: string
  company: string
  location: string
  price: number
  originalPrice: number
  discount: number
  image: string
  hoverImage: string
  href: string
  rating: number
}

export default function ProductCard({
  title,
  company,
  location,
  price,
  originalPrice,
  discount,
  image,
  hoverImage,
  href,
  rating,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const renderStars = (rating: number) => {
    const ratingValue = rating || 0 // Default to 0 if rating is undefined
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < Math.floor(ratingValue) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div
      className="group transform transition-all duration-300 hover:scale-[0.98]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gray rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border hover:border-gray-300">
        <Link href={`/product/${href.split("/").pop()}`}>
          <div className="relative aspect-square overflow-hidden p-4 bg-white-100">
            {/* Discount Badge */}
            <div className="absolute top-6 left-6 z-10">
              <span className="bg-emerald-400 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                {discount}% OFF
              </span>
            </div>

            {/* Product Images */}
            <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
              <Image
                src={isHovered ? hoverImage : image}
                alt={title}
                fill
                className="object-cover transition-opacity duration-300 rounded-lg"
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
            </div>
          </div>
        </Link>

        <div className="p-3 space-y-2">
          {/* Product Title with href */}
          <Link
            href={`/product/${href.split("/").pop()}`}
            className="block hover:text-emerald-600 transition-colors duration-300"
          >
            <h3 className="text-white-800 font-medium text-sm line-clamp-2 min-h-[2.5rem] hover:text-gray-800">
              {title}
            </h3>
          </Link>

          {/* Star Rating */}
          <div className="flex items-center">
            {renderStars(rating)}
            <span className="ml-1 text-xs text-gray-600">({rating ? rating.toFixed(1) : "0.0"})</span>
          </div>

          {/* Company and Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <Building2 className="w-3 h-3" />
              <span className="text-xs">{company}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{location}</span>
            </div>
          </div>

          {/* Cart Button and Pricing */}
          <div className="flex items-center justify-between mt-3">
            <button className="px-3 py-1 bg-green-900 text-white text-xs font-medium rounded hover:bg-blue-500 transition-colors duration-300 flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              Cart
            </button>
            <div className="text-right">
              <span className="text-sm font-bold text-blue-600">₹{price.toLocaleString()}</span>
              <span className="block text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

