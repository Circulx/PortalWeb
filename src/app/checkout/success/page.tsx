"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Package, CheckCircle } from "lucide-react"

interface OrderProduct {
  id: string
  title: string
  price: number
  quantity: number
  image_link: string
}

interface OrderDetails {
  orderId: string
  totalAmount: number
  products: OrderProduct[]
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we have any order data in session storage
    const hasOrderCompleted = sessionStorage.getItem("lastOrderCompleted")
    const storedOrderDetails = sessionStorage.getItem("orderDetails")

    if (storedOrderDetails) {
      try {
        const parsedDetails = JSON.parse(storedOrderDetails)

        // If we have an orderId, fetch the order details from the API
        if (orderId || parsedDetails.orderId) {
          fetchOrderDetails(orderId || parsedDetails.orderId)
        } else {
          setOrderDetails(parsedDetails)
          setLoading(false)
        }
      } catch (e) {
        console.error("Error parsing order details:", e)
        setLoading(false)
      }
    } else if (orderId) {
      // If we have an orderId but no stored details, fetch from API
      fetchOrderDetails(orderId)
    } else if (!hasOrderCompleted && !orderId) {
      // If no order was completed and no orderId in URL, redirect to home
      router.push("/")
    } else {
      setLoading(false)
    }

    // Clean up session storage after retrieving the data
    return () => {
      sessionStorage.removeItem("lastOrderCompleted")
      sessionStorage.removeItem("orderDetails")
    }
  }, [orderId, router])

  const fetchOrderDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }

      const data = await response.json()

      // Transform the data to match our OrderDetails interface
      const transformedData: OrderDetails = {
        orderId: data._id || data.orderId || id,
        totalAmount: data.totalAmount || data.total || 0,
        products:
          data.products?.map((product: any) => ({
            id: product.productId || product.id || "unknown",
            title: product.title || product.name || "Product",
            price: product.price || 0,
            quantity: product.quantity || 1,
            image_link: product.image_link || product.image || product.imageUrl || "/placeholder.svg",
          })) || [],
      }

      setOrderDetails(transformedData)
    } catch (error) {
      console.error("Error fetching order details:", error)
      // If API fetch fails, try to use the stored details
      const storedOrderDetails = sessionStorage.getItem("orderDetails")
      if (storedOrderDetails) {
        try {
          setOrderDetails(JSON.parse(storedOrderDetails))
        } catch (e) {
          console.error("Error parsing stored order details:", e)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-5xl w-full">
        {/* Success Header with Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your order has been placed successfully 🎉</h1>
        </div>

        {/* Two-column layout for Order Items and Order Summary */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Order Items Section - Left Column */}
          {orderDetails && orderDetails.products && orderDetails.products.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 md:w-[450px]">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                Order Items
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {orderDetails.products.map((product) => (
                  <div key={product.id} className="flex gap-3 border-b border-gray-100 pb-3">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={product.image_link || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                        onError={handleImageError}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{product.title}</h3>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Qty: {product.quantity}</span>
                        <span className="font-medium text-gray-700">₹{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary Section - Right Column */}
          {(orderId || (orderDetails && orderDetails.orderId)) && (
            <div className="bg-white rounded-lg shadow-md p-5 flex-1">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Order Reference:</span>
                  <span className="font-medium">{orderId || orderDetails?.orderId}</span>
                </div>

                {orderDetails && (
                  <>
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Items:</span>
                      <span className="font-medium">{orderDetails.products?.length || 0}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-lg">₹{orderDetails.totalAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-gray-600 mt-6 mb-6">
                Thank you for your order! Your purchase has been successfully placed. We are processing it and will
                update you with the shipping details shortly.
              </p>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-md transition-colors text-lg font-medium w-full"
              >
                SHOP MORE
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
