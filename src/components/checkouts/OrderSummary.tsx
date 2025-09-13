"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { PaymentMethod } from "./paymentOptions"
import { validateMOQ } from "@/lib/moq"

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

  const moqStatus = validateMOQ(subTotal)

  const handlePlaceOrderClick = () => {
    if (!moqStatus.isValid) {
      alert(`Minimum order requirement not met. ${moqStatus.message}`)
      return
    }
    onPlaceOrder()
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4 text-center">Order Summary</h2>

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
            <span className="text-gray-600">Sub-total</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%)</span>
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

        <div
          className={`mb-4 p-3 rounded-lg border text-sm ${
            moqStatus.isValid ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {moqStatus.isValid ? (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-medium">{moqStatus.isValid ? "MOQ Requirement Met" : "Minimum Order Required"}</span>
          </div>
          <p className="text-xs mt-1">{moqStatus.message}</p>
        </div>

        {/* Place Order Button - only shown when all steps are completed */}
        {allStepsCompleted && (
          <button
            onClick={handlePlaceOrderClick}
            disabled={isProcessing || !moqStatus.isValid}
            className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center transition-colors ${
              moqStatus.isValid && !isProcessing
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
                Placing order...
              </>
            ) : !moqStatus.isValid ? (
              `ADD ₹${moqStatus.shortfall.toLocaleString()} MORE`
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
