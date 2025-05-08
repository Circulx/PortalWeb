"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Zap } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { addToWishlist, removeFromWishlist } from "@/store/slices/wishlistSlice"
import type { RootState } from "@/store"
import { toast } from "react-hot-toast"
import { AuthModal } from "@/components/auth/auth-modal"
import { getCurrentUser } from "@/actions/auth"
import { useCartSync } from "@/hooks/useCartSync"

interface ProductActionsProps {
  productId: string
  title: string
  price: number
  imageUrl: string
  discount?: number
  sellerId: number
  stock: number
  units?: string
  productImages: string[]
}

export default function ProductActions({
  productId,
  title,
  price,
  imageUrl,
  discount = 0,
  sellerId,
  stock,
  units = "units",
  productImages,
}: ProductActionsProps) {
  const dispatch = useDispatch()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [buyNowClicked, setBuyNowClicked] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(false)
  const router = useRouter()

  // Get wishlist items from Redux store
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  // Check if this product is in the wishlist
  useEffect(() => {
    const itemInWishlist = wishlistItems.some((item) => item.id === productId)
    setIsWishlisted(itemInWishlist)
  }, [wishlistItems, productId])

  const { addItem } = useCartSync()

  // Handle adding to cart
  const handleAddToCart = () => {
    addItem({
      item: {
        id: productId,
        title,
        image_link: imageUrl,
        price: Math.round(price),
        discount,
        seller_id: sellerId,
        units,
        quantity: 1,
      },
      stock,
    })

    // Show success toast
    toast.success("Added to cart successfully!", {
      duration: 3000,
      position: "bottom-center",
    })
  }

  // Handle Buy Now functionality
  const handleBuyNow = async () => {
    if (stock <= 0) {
      toast.error("Product is out of stock", {
        duration: 3000,
        position: "bottom-center",
      })
      return
    }

    setIsCheckingUser(true)
    try {
      const user = await getCurrentUser()
      if (user) {
        // User is logged in, add to cart and proceed to checkout
        addItem({
          item: {
            id: productId,
            title,
            image_link: imageUrl,
            price: Math.round(price),
            discount,
            seller_id: sellerId,
            units,
            quantity: 1,
          },
          stock,
        })
        router.push("/checkout")
      } else {
        // User is not logged in, show auth modal
        setBuyNowClicked(true)
        setIsAuthModalOpen(true)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      // If there's an error, show auth modal to be safe
      setBuyNowClicked(true)
      setIsAuthModalOpen(true)
    } finally {
      setIsCheckingUser(false)
    }
  }

  const handleAuthSuccess = () => {
    // Close the auth modal
    setIsAuthModalOpen(false)

    if (buyNowClicked) {
      // If buy now was clicked, add to cart and proceed to checkout
      addItem({
        item: {
          id: productId,
          title,
          image_link: imageUrl,
          price: Math.round(price),
          discount,
          seller_id: sellerId,
          units,
          quantity: 1,
        },
        stock,
      })
      router.push("/checkout")
      setBuyNowClicked(false)
    }
  }

  // Handle toggling wishlist
  const handleToggleWishlist = () => {
    if (isWishlisted) {
      // If already in wishlist, remove it
      dispatch(removeFromWishlist(productId))
      toast.success("Removed from wishlist", {
        duration: 3000,
        position: "bottom-center",
      })
      setIsWishlisted(false) // Update local state
    } else {
      // If not in wishlist, add it
      dispatch(
        addToWishlist({
          id: productId,
          title,
          image_link: imageUrl,
          price: Math.round(price),
          discount,
          seller_id: sellerId,
          units: undefined,
          stock: 0,
        }),
      )
      toast.success("Added to wishlist successfully!", {
        duration: 3000,
        position: "bottom-center",
      })
      setIsWishlisted(true) // Update local state
    }
  }

  return (
    <>
      {/* Main product image container with wishlist button */}
      <div className="relative flex flex-col items-center md:ml-8">
        <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200 mb-4">
          {/* Wishlist heart button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            <Heart
              className={`w-6 h-6 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"}`}
            />
          </button>

          <img src={productImages[0] || "/placeholder.svg"} alt={title} className="w-full h-[400px] object-contain" />
        </div>

        {/* Action Buttons */}
        <div className="w-full">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className="bg-orange-400 hover:bg-orange-500 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors"
              disabled={isCheckingUser}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors"
              disabled={isCheckingUser}
            >
              <Zap className="w-5 h-5 mr-2" />
              {isCheckingUser ? "PLEASE WAIT..." : "BUY NOW"}
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  )
}
