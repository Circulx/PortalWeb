"use client"

import React, { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import Image from "next/image"

interface OrderSummaryProps {
  onPlaceOrder: () => void
  onTotalAmountChange: (amount: number) => void
  isProcessing?: boolean
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onPlaceOrder, onTotalAmountChange, isProcessing = false }) => {
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailSignup, setEmailSignup] = useState(false)

  // Calculate totals
  const calculateSubTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateDiscount = () => {
    return 24 // Fixed discount for demo
  }

  const calculateTax = () => {
    return 61.99 // Fixed tax for demo
  }

  const calculateTotal = () => {
    const subTotal = calculateSubTotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subTotal - discount + tax
  }

  React.useEffect(() => {
    const totalAmount = calculateTotal()
    onTotalAmountChange(totalAmount)
  }, [cartItems])

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header - Centered title */}
      <div className="p-4 border-b border-gray-200 text-center">
        <h2 className="text-xl font-medium">Order Summary</h2>
      </div>

      {/* Cart Items */}
      <div className="border-b border-gray-200">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center p-4 border-b border-gray-100 last:border-b-0">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image src={item.image_link || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="font-medium line-clamp-1">{item.title}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-500">
                  {item.quantity} × ₹{item.price}
                </span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Sub-total</span>
          <span>₹{calculateSubTotal()}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Discount</span>
          <span>-{calculateDiscount()}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Tax</span>
          <span>{calculateTax()}</span>
        </div>
        <div className="flex justify-between py-2 font-bold text-lg">
          <span>Total</span>
          <span>₹{calculateTotal().toFixed(2)} INR</span>
        </div>
      </div>

      {/* Terms and Checkout Button */}
      <div className="p-4">
        <div className="mb-3">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 mr-2"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span className="text-sm">
              I agree to the{" "}
              <a href="#" className="text-blue-500">
                Terms & conditions
              </a>
            </span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 mr-2"
              checked={emailSignup}
              onChange={(e) => setEmailSignup(e.target.checked)}
            />
            <span className="text-sm">Sign me up to the email list</span>
          </label>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={!termsAccepted || isProcessing}
          className={`w-full bg-orange-300 hover:bg-orange-400 text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
            !termsAccepted || isProcessing ? "opacity-60 cursor-not-allowed" : ""
          }`}
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
          ) : (
            "PLACE ORDER →"
          )}
        </button>
      </div>
    </div>
  )
}

export default OrderSummary
