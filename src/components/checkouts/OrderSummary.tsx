"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { PaymentMethod } from "./paymentOptions"

interface OrderSummaryProps {
  onPlaceOrder: () => void
  onTotalAmountChange: (amount: number) => void
  isProcessing: boolean
  paymentMethod: PaymentMethod | null
  allStepsCompleted?: boolean
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  onPlaceOrder,
  onTotalAmountChange,
  isProcessing,
  paymentMethod,
  allStepsCompleted = false,
}) => {
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [subTotal, setSubTotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)

  // Calculate totals
  useEffect(() => {
    const calculatedSubTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const calculatedDiscount = 0 // For demo purposes
    const calculatedTax = calculatedSubTotal * 0.18 // 18% tax for demo
    const calculatedTotal = calculatedSubTotal - calculatedDiscount + calculatedTax

    setSubTotal(calculatedSubTotal)
    setDiscount(calculatedDiscount)
    setTax(calculatedTax)
    setTotal(calculatedTotal)

    // Notify parent component of total amount
    onTotalAmountChange(calculatedTotal)
  }, [cartItems, onTotalAmountChange])

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-medium mb-4">Order Summary</h2>

        {/* Order Items */}
        <div className="space-y-3 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                  {item.quantity}
                </span>
                <span className="text-sm text-gray-700 truncate max-w-[180px]">{item.title}</span>
              </div>
              <span className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-4"></div>

        {/* Price Breakdown */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-₹{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (18%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-4"></div>

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-medium">Total</span>
          <span className="text-lg font-bold">₹{total.toFixed(2)}</span>
        </div>

        {/* Place Order Button - only shown when all steps are completed */}
        {allStepsCompleted && (
          <button
            onClick={onPlaceOrder}
            disabled={isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : paymentMethod === "ONLINE" ? (
              "PLACE ORDER →"
            ) : (
              "PLACE ORDER →"
            )}
          </button>
        )}

        {/* Message when steps are not completed */}
        {!allStepsCompleted && (
          <div className="text-sm text-gray-600 text-center">
            <p>Complete all steps to place your order</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSummary
