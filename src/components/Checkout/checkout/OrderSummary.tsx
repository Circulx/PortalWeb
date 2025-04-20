"use client"

import React, { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import Image from "next/image"
import Checkbox from "./ui/Checkbox"

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
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-medium mb-4">Order Summary</h2>

      <div className="mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-start mb-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={item.image_link || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {item.quantity} × ₹{item.price}
                </span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4">
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
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">Tax</span>
          <span>{calculateTax()}</span>
        </div>
        <div className="flex justify-between py-3 font-bold">
          <span>Total</span>
          <span>₹{calculateTotal().toFixed(2)} INR</span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Review & Place Order</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please review the order details and payment details before proceeding to confirm your order
        </p>

        <div className="mb-4">
          <Checkbox
            label={
              <span className="text-sm">
                I agree to the{" "}
                <a href="#" className="text-blue-500">
                  Terms & conditions
                </a>
                ,{" "}
                <a href="#" className="text-blue-500">
                  Privacy Policy
                </a>
              </span>
            }
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
        </div>

        <div className="mb-6">
          <Checkbox
            label={<span className="text-sm">Sign me up to the email list</span>}
            checked={emailSignup}
            onChange={(e) => setEmailSignup(e.target.checked)}
          />
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={!termsAccepted || isProcessing}
          className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
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