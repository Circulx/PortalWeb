"use client"

import type React from "react"
import { useState } from "react"
import Script from "next/script"

export type PaymentMethod = "COD" | "ONLINE"

interface PaymentOptionsProps {
  onPaymentMethodSelect: (
    method: PaymentMethod,
    paymentDetails?: {
      paymentId: string
      orderId: string
      signature: string
    },
  ) => void
  disabled?: boolean
  amount: number // Total amount to be paid
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal?: {
    ondismiss: () => void
  }
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ onPaymentMethodSelect, disabled = false, amount }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("COD")
  const [isProcessing, setIsProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentId: string
    orderId: string
    signature: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle Razorpay script loading
  const handleRazorpayLoad = () => {
    console.log("Razorpay script loaded successfully")
    setRazorpayLoaded(true)
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    // Reset payment details when changing methods
    setPaymentDetails(null)
    setError(null)
  }

  // Initialize Razorpay payment
  const initializeRazorpay = async () => {
    if (!razorpayLoaded) {
      setError("Payment gateway is still loading. Please try again in a moment.")
      return
    }

    if (!amount || amount <= 0) {
      setError("Invalid payment amount. Please try again.")
      console.error("Invalid amount:", amount)
      return
    }

    setIsProcessing(true)
    setError(null)

    // Check if Razorpay key is available
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError("Payment configuration error. Please contact support.")
      setIsProcessing(false)
      return
    }

    try {
      console.log("Creating Razorpay order with amount:", amount)

      // Call backend to create an order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            description: "Order payment",
          },
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || "Failed to create order")
      }

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order")
      }

      console.log("Order created successfully:", orderData)

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: Number(orderData.amount),
        currency: orderData.currency,
        name: "Your Store Name",
        description: "Purchase Payment",
        order_id: orderData.id,
        handler: (response: RazorpayPaymentResponse) => {
          // This function runs when payment is successful
          console.log("Payment successful:", response)
          setPaymentDetails({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          })

          // Call the onPaymentMethodSelect with payment details
          onPaymentMethodSelect("ONLINE", {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          })

          setIsProcessing(false)
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F97316", // Orange color to match your theme
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed")
            setIsProcessing(false)
          },
        },
      }

      // Open Razorpay payment form
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Razorpay Error:", error)
      setError(error instanceof Error ? error.message : "Payment initialization failed")
      setIsProcessing(false)
    }
  }

  const handleContinue = () => {
    if (selectedMethod === "COD") {
      // For cash on delivery, just proceed
      onPaymentMethodSelect("COD")
    } else {
      // For online payment methods
      if (paymentDetails) {
        // If payment is already completed, proceed with the payment details
        onPaymentMethodSelect("ONLINE", paymentDetails)
      } else {
        // Otherwise initialize Razorpay
        initializeRazorpay()
      }
    }
  }

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleRazorpayLoad}
        onError={() => {
          console.error("Failed to load Razorpay script")
          setError("Failed to load payment gateway. Please try again later.")
        }}
        strategy="lazyOnload"
      />

      <div
        className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-70 pointer-events-none" : ""}`}
      >
        <h2 className="text-lg font-medium mb-2">Payment Option</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose a payment method to continue checking out. You will still have a chance to review and edit your order
          before it is final.
        </p>

        {/* Horizontal Divider at the Top */}
        <div className="w-full h-px bg-gray-200 mb-4"></div>

        {/* Error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700 font-medium">Error</span>
            </div>
            <p className="text-red-600 text-sm mt-1 ml-7">{error}</p>
          </div>
        )}

        {/* On mobile: Vertical stacked with each item taking full width */}
        <div className="sm:hidden">
          {/* Cash on Delivery */}
          <div
            className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
              selectedMethod === "COD" ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect("COD")}
          >
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-3">
                <div className="w-8 h-8 flex items-center justify-center text-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                </div>
              </div>
              <span className="text-sm text-gray-700">Cash on Delivery</span>
            </div>

            {/* Selection Circle */}
            {selectedMethod === "COD" ? (
              <div className="relative h-4 w-4">
                <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full border border-gray-300"></div>
            )}
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          {/* Online Payment (Razorpay) */}
          <div
            className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
              selectedMethod === "ONLINE" ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect("ONLINE")}
          >
            <div className="flex items-center">
              <div className="relative w-8 h-8 mr-3">
                <div className="w-8 h-8 flex items-center justify-center text-purple-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-700">Online Payment (Card/UPI/Wallet)</span>
                <span className="text-xs font-medium text-orange-600 mt-1">Pay Amount INR {amount.toFixed(2)}</span>
              </div>
            </div>

            {selectedMethod === "ONLINE" ? (
              <div className="relative h-4 w-4">
                <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
              </div>
            ) : (
              <div className="h-4 w-4 rounded-full border border-gray-300"></div>
            )}
          </div>
        </div>

        {/* On larger screens: Horizontal layout with equal width columns */}
        <div className="hidden sm:flex">
          {/* Cash on Delivery */}
          <div
            className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
              selectedMethod === "COD" ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect("COD")}
          >
            <div className="w-8 h-8 flex items-center justify-center text-green-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M6 12h.01M18 12h.01"></path>
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center mb-6">Cash on Delivery</span>

            {/* Circle at the Bottom */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              {selectedMethod === "COD" ? (
                <div className="relative h-4 w-4">
                  <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-gray-300"></div>
              )}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-16 w-px bg-gray-200 my-2"></div>

          {/* Online Payment (Razorpay) */}
          <div
            className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
              selectedMethod === "ONLINE" ? "bg-orange-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleMethodSelect("ONLINE")}
          >
            <div className="w-8 h-8 flex items-center justify-center text-purple-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <span className="text-xs text-gray-700 text-center">Online Payment (Card/UPI/Wallet)</span>
            <span className="text-xs font-medium text-orange-600 mt-1 mb-4">Pay Amount INR {amount.toFixed(2)}</span>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              {selectedMethod === "ONLINE" ? (
                <div className="relative h-4 w-4">
                  <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
                </div>
              ) : (
                <div className="h-4 w-4 rounded-full border border-gray-300"></div>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Divider at the Bottom */}
        <div className="w-full h-px bg-gray-200 mt-4 mb-6"></div>

        {/* Payment Status */}
        {paymentDetails && selectedMethod === "ONLINE" && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-700 font-medium">Payment Successful!</span>
            </div>
            <p className="text-green-600 text-sm mt-1 ml-7">Payment ID: {paymentDetails.paymentId}</p>
            <p className="text-green-600 text-sm mt-1 ml-7">Order ID: {paymentDetails.orderId}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={isProcessing}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : paymentDetails && selectedMethod === "ONLINE" ? (
              "Continue to Review"
            ) : selectedMethod === "COD" ? (
              "Continue with Cash on Delivery"
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      </div>
    </>
  )
}

export default PaymentOptions
