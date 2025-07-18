"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Building2, Heart, MapPin, ShoppingCart, Star } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useCartSync } from "@/hooks/useCartSync"
import { useWishlistSync } from "@/hooks/useWishlistSync"
import { toast } from "react-hot-toast"

interface ProductCardProps {
  title: string
  company: string
  location: string
  price: number
  originalPrice: number
  discount: number
  image_link: string
  hoverImage: string
  href: string
  rating: number
  reviewCount?: number
  seller_id: number
  units?: string
  stock: number
}

export default function ProductCard({
  title,
  company,
  location,
  price,
  originalPrice,
  discount,
  image_link,
  hoverImage,
  href,
  rating,
  reviewCount = 0,
  seller_id,
  units,
  stock,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false)

  // Get wishlist items from Redux store
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  // Extract product ID from href
  const productId = href.split("/").pop() || ""

  // Check if this product is in the wishlist
  useEffect(() => {
    const itemInWishlist = wishlistItems.some((item) => item.id === href)
    setIsWishlisted(itemInWishlist)
  }, [wishlistItems, href])

  // Calculate the discounted price
  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
    return originalPrice - (originalPrice * discountPercentage) / 100
  }

  // Calculate the actual discounted price
  const calculatedPrice = calculateDiscountedPrice(originalPrice, discount)

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    // Add full stars (yellow filled)
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative inline-block">
          <Star className="w-4 h-4 text-gray-300 fill-gray-300" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>,
      )
    }

    // Add empty stars (gray)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-gray-300" />)
    }

    return <div className="flex items-center gap-0.5">{stars}</div>
  }

  const { addItem: addToCart } = useCartSync()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isLoading: wishlistLoading } = useWishlistSync()

  const handleAddToCart = useCallback(() => {
    addToCart({
      item: {
        id: href,
        title,
        image_link,
        price: calculatedPrice, // Use the calculated price
        discount,
        seller_id,
        units,
        quantity: 1,
      },
      stock: stock,
    })

    // Show toast notification
    toast.success("Added to cart successfully!", {
      duration: 2000,
      position: "bottom-center",
    })
  }, [addToCart, href, title, image_link, calculatedPrice, discount, seller_id, units, stock])

  // Handle toggling the wishlist status
  const handleToggleWishlist = useCallback(async () => {
    // Prevent multiple clicks while processing
    if (isProcessingWishlist || wishlistLoading) return

    setIsProcessingWishlist(true)

    try {
      if (isWishlisted) {
        // If already in wishlist, remove it
        await removeFromWishlist(href)
        toast.success("Removed from wishlist", {
          duration: 2000,
          position: "bottom-center",
        })
      } else {
        // If not in wishlist, add it
        await addToWishlist({
          id: href,
          title,
          image_link,
          price: calculatedPrice,
          discount,
          seller_id,
          units: undefined,
          stock: 0,
        })
        toast.success("Added to wishlist successfully!", {
          duration: 2000,
          position: "bottom-center",
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Error updating wishlist. Please try again.", {
        duration: 2000,
        position: "bottom-center",
      })
    } finally {
      // Add a small delay before allowing another action
      setTimeout(() => {
        setIsProcessingWishlist(false)
      }, 300)
    }
  }, [
    isProcessingWishlist,
    wishlistLoading,
    isWishlisted,
    removeFromWishlist,
    href,
    addToWishlist,
    title,
    image_link,
    calculatedPrice,
    discount,
    seller_id,
  ])

  // Debug log to verify rating is being received
  console.log(`Product Card - Title: ${title}, Rating: ${rating}, ReviewCount: ${reviewCount}`)

  return (
    <div
      className="group transform transition-all duration-300 hover:scale-[0.98]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 
        border ${isHovered ? "border-green-900 border-2" : "border-gray-200 border"}`}
      >
        <Link href={`/products/${productId}`}>
          <div className="relative aspect-square overflow-hidden p-2 bg-white-100">
            <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
              <Image
                src={isHovered ? hoverImage : image_link}
                alt={title}
                fill
                className="object-cover transition-opacity duration-300 rounded-lg"
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
            </div>
          </div>
        </Link>

        <div className="p-2 space-y-1.5">
          {/* Product Title with href */}
          <Link href={`/products/${productId}`} className="block hover:text-green-900 transition-colors duration-300">
            <h3 className="text-gray-800 font-medium text-sm line-clamp-2 min-h-[2.4rem] hover:text-gray-800">
              {title}
            </h3>
          </Link>

          {/* Star Rating with Review Count */}
          <div className="flex items-center gap-1">
            {renderStars(rating)}
            <span className="ml-1 text-xs text-gray-600 font-medium">({rating > 0 ? rating.toFixed(1) : "0.0"})</span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">
                • {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Company */}
          <div className="flex items-center gap-1 text-gray-600">
            <Building2 className="w-3 h-3" />
            <span className="text-xs">{company}</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-sm font-bold text-green-900">₹{calculatedPrice.toFixed(2)}</span>
              <span className="block text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
            </div>
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded">{discount}% off</span>
          </div>

          {/* Bottom row with location, discount and actions - evenly spaced */}
          <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-gray-100">
            {/* Location info with icon */}
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3 h-3" />
              <span className="text-xs truncate max-w-[80px]">{location}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className="px-3 py-0.5 bg-green-900 text-white text-xs font-medium rounded hover:bg-green-800 transition-colors duration-300 flex items-center gap-1"
              >
                <ShoppingCart className="w-3 h-3" />
                Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={isProcessingWishlist || wishlistLoading}
                className={`p-0.5 rounded-full border ${
                  isWishlisted ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                } hover:bg-gray-100 transition-colors duration-300 ${
                  isProcessingWishlist || wishlistLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">Available: {stock} units</p>
        </div>
      </div>
    </div>
  )
}
