"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../store"
import { removeItem as removeItemAction, updateItemStock } from "../../store/slices/cartSlice"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import ProductCard from "@/components/layout/product-card"
import "swiper/css"
import { ChevronLeft, ChevronRight, Trash2, AlertCircle, Heart, ShoppingCart } from "lucide-react"
import { AuthModal } from "@/components/auth/auth-modal"
import { getCurrentUser } from "@/actions/auth"
import { useCartSync } from "@/hooks/useCartSync"
import { useWishlistSync } from "@/hooks/useWishlistSync"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import FeaturesSection from "@/components/layout/features-section"
import CartAdvertisement from "./CartAdvertisement"
import AdvertisementPreloader from "@/components/home/advertisement-preloader"

interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: object
  image_link: string
  stock: number
  price: number
  discount: number
  SKU: string
  seller_id?: number
  created_at?: string
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

interface BrowsingHistoryItem {
  productId: string
  title?: string
  image?: string
}





// Component for browsing history cards that matches the product card style
function BrowsingHistoryCard({ item }: { item: BrowsingHistoryItem }) {
  const [productData, setProductData] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addItem: addToCart } = useCartSync()
  const { addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistSync()
  const { toast } = useToast()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const isWishlisted = wishlistItems.some((wishItem) => wishItem.id === item.productId)

  // Fetch full product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get("/api/products")
        const products: Product[] = response.data
        const product = products.find((p) => p.product_id.toString() === item.productId)
        setProductData(product || null)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [item.productId])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!productData) return

    addToCart({
      item: {
        id: item.productId,
        title: productData.title,
        image_link: productData.image_link,
        price: productData.price,
        discount: productData.discount || 0,
        seller_id: productData.product_id,
        units: productData.units || "units",
        quantity: 1,
      },
      stock: productData.stock,
    })

    toast({
      title: "Added to cart",
      description: `${productData.title} has been added to your cart.`,
    })
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!productData) return

    try {
      if (isWishlisted) {
        await removeFromWishlist(item.productId)
        toast({
          title: "Removed from wishlist",
          description: `${productData.title} has been removed from your wishlist.`,
        })
      } else {
        await addToWishlist({
          id: item.productId,
          title: productData.title,
          image_link: productData.image_link,
          price: productData.price,
          discount: productData.discount || 0,
          seller_id: productData.product_id,
          units: undefined,
          stock: 0,
        })
        toast({
          title: "Added to wishlist",
          description: `${productData.title} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-shrink-0 w-[262px] bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 rounded mb-2"></div>
          <div className="bg-gray-200 h-4 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <Link href={`/products/${item.productId}`} className="flex-shrink-0 w-[280px] bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative h-48 mb-4">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.title || "Product"}
            fill
            className="object-contain rounded"
          />
        </div>
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title || "Product"}</h3>
        <p className="text-sm text-gray-500">Product details unavailable</p>
      </Link>
    )
  }

  return (
    <div className="flex-shrink-0 w-[262px]">
      <ProductCard
        title={productData.title}
        company={productData.seller_name}
        location={productData.location}
        price={productData.price}
        discount={productData.discount}
        image_link={productData.image_link}
        href={`/products/${productData.product_id}`}
        rating={productData.rating}
        originalPrice={productData.price + (productData.discount || 0)}
        hoverImage={productData.image_link}
        seller_id={productData.seller_id || 0}
        stock={productData.stock}
        units={productData.units}
      />
    </div>
  )
}

export default function Cart() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { toast } = useToast()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const cartInitialized = useSelector((state: RootState) => state.cart.initialized)
  const [stockWarnings, setStockWarnings] = useState<Record<string, boolean>>({})
  const [isUpdatingStock, setIsUpdatingStock] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setIsCheckingUser(false)
      }
    }

    checkUser()
  }, [])

  // Background stock validation (non-blocking)
  useEffect(() => {
    const validateStock = async () => {
      if (cartItems.length === 0 || !cartInitialized) return

      setIsUpdatingStock(true)
      try {
        // Fetch all products to get their current stock
        const response = await axios.get("/api/products")
        const products = response.data

        let hasStockIssues = false
        const newWarnings: Record<string, boolean> = {}

        // Update stock information for each cart item
        cartItems.forEach((item) => {
          const productId = Number.parseInt(item.id)
          const product = products.find((p: any) => p.product_id === productId)

          if (product) {
            // Update the stock in the cart state
            dispatch(
              updateItemStock({
                productId: item.id,
                stock: product.stock,
              }),
            )

            // Check if we need to show a warning (quantity exceeds stock)
            if (item.quantity > product.stock) {
              newWarnings[item.id] = true
              hasStockIssues = true

              // If product is out of stock, remove it from cart
              if (product.stock === 0) {
                dispatch(removeItemAction(item.id))
                toast({
                  title: "Product Removed",
                  description: `"${item.title}" is out of stock and has been removed from your cart.`,
                  variant: "destructive",
                })
              }
            }
          }
        })

        setStockWarnings(newWarnings)

        if (hasStockIssues) {
          toast({
            title: "Stock Updated",
            description: "Some items in your cart have limited stock. Quantities have been adjusted.",
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error validating stock:", error)
      } finally {
        setIsUpdatingStock(false)
      }
    }

    // Run stock validation in background after cart is loaded
    const timeoutId = setTimeout(validateStock, 1000)
    return () => clearTimeout(timeoutId)
  }, [cartItems.length, cartInitialized, dispatch, toast])

  const { increaseQuantity, decreaseQuantity, removeItem, clearCart } = useCartSync()

  const handleIncrement = (id: string) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      if (item.quantity >= item.stock) {
        // Show warning if trying to add more than available stock
        setStockWarnings((prev) => ({ ...prev, [id]: true }))

        toast({
          title: "Stock limit reached",
          description: `Only ${item.stock} units of "${item.title}" are available.`,
          variant: "destructive",
        })

        return
      }

      // Clear warning if it was previously shown
      if (stockWarnings[id]) {
        setStockWarnings((prev) => {
          const newWarnings = { ...prev }
          delete newWarnings[id]
          return newWarnings
        })
      }

      increaseQuantity(id)
    }
  }

  const handleDecrement = (id: string) => {
    const item = cartItems.find((item) => item.id === id)
    if (item && item.quantity <= 1) {
      // If quantity is 1 or less, remove the item completely
      removeItem(id)
    } else {
      // Otherwise just decrease the quantity
      decreaseQuantity(id)

      // Clear warning if it was previously shown
      if (stockWarnings[id]) {
        setStockWarnings((prev) => {
          const newWarnings = { ...prev }
          delete newWarnings[id]
          return newWarnings
        })
      }
    }
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)

    // Clear warning if it was previously shown
    if (stockWarnings[id]) {
      setStockWarnings((prev) => {
        const newWarnings = { ...prev }
        delete newWarnings[id]
        return newWarnings
      })
    }
  }

  const handleClearCart = () => {
    clearCart()
    setStockWarnings({})
  }

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [historyItems, setHistoryItems] = useState<BrowsingHistoryItem[]>([])
  const historyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const response = await axios.get("/api/products")
        const products: Product[] = response.data
        // Limit to 8 most recent products
        const recentProducts = products.slice(0, 8)
        setRecommendedProducts(recentProducts)
      } catch (error) {
        console.error("Error fetching recommended products:", error)
      }
    }

    fetchRecommendedProducts()
  }, [])

  // Load browsing history (user -> API, guest -> localStorage)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/browsing-history?limit=16")
        const data = await res.json()
        if (Array.isArray(data.items) && data.items.length > 0) {
          const items = data.items.map((x: any) => ({
            productId: x.productId,
            title: x.title,
            image: x.image,
          }))
          setHistoryItems(items)
          return
        }
      } catch (_err) {
        // fall back to guest storage
      }

      try {
        const key = "guest_browsing_history"
        const guest = JSON.parse(localStorage.getItem(key) || "[]") as Array<any>
        const items = guest.map((x) => ({ productId: String(x.productId), title: x.title, image: x.image }))
        setHistoryItems(items)
      } catch (_e) {
        setHistoryItems([])
      }
    }

    loadHistory()
  }, [])

  const calculateSubTotal = (price: number, quantity: number) => {
    return (price || 0) * (quantity || 0)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0
      const quantity = item.quantity || 0
      return total + calculateSubTotal(price, quantity)
    }, 0)
  }

  const calculateCartSubTotal = () => {
    return cartItems.reduce((subTotal, item) => {
      const price = item.price || 0
      const quantity = item.quantity || 0
      return subTotal + calculateSubTotal(price, quantity)
    }, 0)
  }

  const handleReturnToShop = () => {
    router.push("/")
  }

  const handleProceedToCheckout = async () => {
    // Check if user is logged in
    try {
      const user = await getCurrentUser()
      if (user) {
        // User is logged in, proceed to checkout
        router.push("/checkout")
      } else {
        // User is not logged in, show auth modal
        setIsAuthModalOpen(true)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      // If there's an error, show auth modal to be safe
      setIsAuthModalOpen(true)
    }
  }

  const handleAuthSuccess = () => {
    // Close the auth modal
    setIsAuthModalOpen(false)
    // Redirect to checkout page
    router.push("/checkout")
  }

  // Show cart immediately without waiting for initialization
  const displayItems = cartItems || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preload advertisements for faster loading */}
      <AdvertisementPreloader />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              <Link href="/" className="flex items-center">
                <ShoppingCart className="mr-2 text-blue-600" />
                <span>My Cart</span>
              </Link>
            </h1>
            <div className="flex items-center">
              <Link href="/wishlist" className="text-gray-600 hover:text-gray-900 mr-4">
                <Heart size={24} />
              </Link>
              <Link href="/checkout" className="text-orange-600 hover:text-orange-800">
                <ShoppingCart size={24} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Your Cart</h2>

        {/* Show stock update indicator only when updating */}
        {isUpdatingStock && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">Updating stock information...</span>
            </div>
          </div>
        )}

        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-lg text-gray-500">Your cart is empty.</p>
            <Button variant="outline" onClick={handleReturnToShop} className="mt-4">
              Return to Shop
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-3 sm:p-4 border border-[#9E9E9E] rounded shadow-xl">
                {/* Cart header - Hide on small screens, use alternative layout */}
                <div className="hidden sm:flex justify-between border-b pb-2">
                  <h2 className="font-semibold w-1/4 text-left">PRODUCTS</h2>
                  <h2 className="font-semibold w-1/4 text-right">PRICE</h2>
                  <h2 className="font-semibold w-1/4 text-right">QUANTITY</h2>
                  <h2 className="font-semibold w-1/4 text-right">SUB-TOTAL</h2>
                </div>

                <div className="py-2">
                  <div
                    className={`${displayItems.length > 5 ? "max-h-[600px] overflow-y-auto" : ""} pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
                  >
                    <ul>
                      {displayItems.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4"
                        >
                          {/* Product info - Full width on mobile, 1/4 on larger screens */}
                          <div className="w-full sm:w-1/4 flex items-center mb-3 sm:mb-0">
                          <Link href={`${item.id}`} className="flex items-center w-full">
                            <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] flex-shrink-0">
                              <Image
                                src={item.image_link || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover rounded"
                                priority
                              />
                            </div>
                            <div className="ml-3 sm:ml-4 flex-1">
                              <h4 className="text-sm font-semibold line-clamp-2 text-left">{item.title}</h4>
                              {/* Mobile only price */}
                              <p className="text-sm text-gray-600 mt-1 sm:hidden">₹{item.price.toFixed(2)}</p>
                              {/* Stock information */}
                              <p className="text-xs text-gray-500 mt-1">
                                Available: {item.stock || 0} {(item.stock || 0) === 1 ? "unit" : "units"}
                              </p>
                            </div>
                            </Link>
                          </div>

                          {/* Price - Hidden on mobile, shown on larger screens */}
                          <div className="hidden sm:block sm:w-1/4 text-right">
                            <p>₹{item.price.toFixed(2)}</p>
                          </div>

                          {/* Quantity controls - Full width on mobile, 1/4 on larger screens */}
                          <div className="w-full sm:w-1/4 flex justify-between sm:justify-end items-center mb-3 sm:mb-0">
                            <span className="sm:hidden text-sm font-medium">Quantity:</span>
                            <div className="flex border items-center gap-2 relative">
                              <button
                                className="px-2 rounded hover:bg-gray-100"
                                onClick={() => handleDecrement(item.id)}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <p className="w-8 text-center">{item.quantity}</p>
                              <button
                                className={`px-2 rounded ${
                                  item.quantity >= (item.stock || 0)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => handleIncrement(item.id)}
                                disabled={item.quantity >= (item.stock || 0)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                              {stockWarnings[item.id] && (
                                <div className="absolute -top-8 right-0 bg-amber-50 text-amber-700 text-xs p-1 rounded border border-amber-200 whitespace-nowrap flex items-center">
                                  <AlertCircle size={12} className="mr-1" />
                                  Max stock reached
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Subtotal and remove button - Full width on mobile, 1/4 on larger screens */}
                          <div className="w-full sm:w-1/4 flex justify-between sm:justify-end items-center">
                            <span className="sm:hidden text-sm font-medium">Subtotal:</span>
                            <div className="flex items-center">
                              <p className="mr-3">₹{calculateSubTotal(item.price, item.quantity).toFixed(2)}</p>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {displayItems.length > 5 && (
                    <div className="flex justify-center mt-2 space-x-2">
                      <button
                        className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                        onClick={() => {
                          const container = document.querySelector(".overflow-y-auto")
                          if (container) container.scrollBy({ top: -100, behavior: "smooth" })
                        }}
                        aria-label="Scroll up"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                        onClick={() => {
                          const container = document.querySelector(".overflow-y-auto")
                          if (container) container.scrollBy({ top: 100, behavior: "smooth" })
                        }}
                        aria-label="Scroll down"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Action buttons - Ensure they stay inside the cart box */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 pb-2 border-t pt-4">
                  <Button variant="outline" onClick={handleClearCart} className="text-xs sm:text-sm">
                    CLEAR CART
                  </Button>
                  <Button variant="outline" onClick={handleReturnToShop} className="text-xs sm:text-sm">
                    RETURN TO SHOP
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="bg-white p-4 border border-[#9E9E9E] rounded shadow-xl">
                <h2 className="font-semibold border-b text-lg sm:text-xl pb-2">Cart Totals</h2>
                <div className="flex justify-between py-2 font-bold">
                  <span>Sub-total</span>
                  <span>₹{calculateCartSubTotal().toFixed(2)}</span>
                </div>
                
                
                
                

                <button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg mt-4 transition-colors"
                  onClick={handleProceedToCheckout}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Products Section */}
        <div className="mt-16 sm:mt-24 lg:mt-32 max-w-[1120px] mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 text-center">
            Recommended based on your shopping trends
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 justify-center">
            {recommendedProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.product_id}
                title={product.title}
                company={product.seller_name}
                location={product.location}
                price={product.price}
                discount={product.discount}
                image_link={product.image_link}
                href={`/products/${product.product_id}`}
                rating={product.rating}
                originalPrice={product.price + product.discount}
                hoverImage={product.image_link}
                seller_id={product.seller_id || 0}
                stock={product.stock}
              />
            ))}
          </div>
        </div>

        {/* Advertisement Banner - Dynamic from Database */}
        <CartAdvertisement />

        {/* Browsing History Section - slider aligned like Recommended */}
        {historyItems.length > 0 && (
        <div className="mt-16 sm:mt-24 lg:mt-32 max-w-[1120px] mx-auto">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 text-center">Your browsing history</h2>
          <div className="relative">
            <div
              ref={historyRef}
              className="flex overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 gap-4 pb-4"
            >
              {historyItems.map((item) => (
                <BrowsingHistoryCard key={item.productId} item={item} />
              ))}
            </div>
            <button
              onClick={() => historyRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
            <button
              onClick={() => historyRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10"
              aria-label="Next product"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
          </div>
        </div>
        )}

                 {/* Features Section */}
         <FeaturesSection />

        {/* Auth Modal */}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      </div>
    </div>
  )
}
