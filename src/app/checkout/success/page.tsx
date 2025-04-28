"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string
    totalAmount: number
    products: number
  } | null>(null)

  useEffect(() => {
    // Check if we have any order data in session storage
    const hasOrderCompleted = sessionStorage.getItem("lastOrderCompleted")
    const storedOrderDetails = sessionStorage.getItem("orderDetails")

    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails))
      } catch (e) {
        console.error("Error parsing order details:", e)
      }
    }

    if (!hasOrderCompleted && !orderId) {
      // If no order was completed and no orderId in URL, redirect to home
      router.push("/")
    }

    // Clean up session storage after retrieving the data
    return () => {
      sessionStorage.removeItem("lastOrderCompleted")
      sessionStorage.removeItem("orderDetails")
    }
  }, [orderId, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left side - Success message */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Your order has been placed successfully 🎉
            </h1>

            <p className="text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Thank you for your order! Your purchase has been successfully placed. We are processing it and will update
              you with the shipping details shortly. If you have any questions, feel free to contact us. Happy shopping!
            </p>

            {(orderId || (orderDetails && orderDetails.orderId)) && (
              <div className="bg-gray-100 rounded-md p-4 mb-6 max-w-sm mx-auto lg:mx-0">
                <p className="text-sm text-gray-500">Order Reference</p>
                <p className="font-medium text-gray-800">{orderId || orderDetails?.orderId}</p>

                {orderDetails && (
                  <>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Total Amount:</span>
                        <span className="font-medium">₹{orderDetails.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Items:</span>
                        <span className="font-medium">{orderDetails.products}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-md transition-colors text-lg font-medium"
            >
              SHOP MORE
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right side - Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Confirmation dialog */}
              

              {/* Green card */}
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-green-300 rounded-lg w-32 h-32 rotate-12 z-0">
                <div className="flex justify-center items-center h-full">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Main illustration */}
              <Image
                src="/order-success.png"
                alt="Order confirmation illustration"
                width={400}
                height={400}
                className="relative z-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
