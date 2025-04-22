"use client"

import type React from "react"
import { useState } from "react"

export type PaymentMethod = "cash" | "upi" | "paypal" | "amazon" | "card"

interface PaymentOptionsProps {
  onPaymentMethodSelect: (method: PaymentMethod) => void
  disabled?: boolean
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ onPaymentMethodSelect, disabled = false }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const handleContinue = () => {
    if (selectedMethod) {
      onPaymentMethodSelect(selectedMethod)
    }
  }

  return (
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

      {/* On mobile: Vertical stacked with each item taking full width */}
      <div className="sm:hidden">
        {/* Cash on Delivery */}
        <div
          className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
            selectedMethod === "cash" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("cash")}
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
          {selectedMethod === "cash" ? (
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-orange-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full border border-gray-300"></div>
          )}
        </div>

        <div className="w-full h-px bg-gray-200"></div>

        {/* UPI ID Payment */}
        <div
          className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
            selectedMethod === "upi" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("upi")}
        >
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-3">
              <div className="w-8 h-8 flex items-center justify-center text-blue-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.5 19.5L19.5 4.5M12 4.5V19.5M4.5 12H19.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <span className="text-sm text-gray-700">UPI ID Payment</span>
          </div>

          {selectedMethod === "upi" ? (
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-orange-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full border border-gray-300"></div>
          )}
        </div>

        <div className="w-full h-px bg-gray-200"></div>

        {/* Paypal */}
        <div
          className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
            selectedMethod === "paypal" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("paypal")}
        >
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-3">
              <div className="w-8 h-8 flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M7.996 0h8.008C19.763 0 22 2.239 22 5.997v12.006C22 21.761 19.761 24 16.004 24H7.996C4.237 24 2 21.761 2 18.003V5.997C2 2.239 4.239 0 7.996 0zm7.906 7.347c.78-.014 1.02.295 1.11.662-.51.31-.99.587-1.56.861-.83.4-1.73.7-2.65.9-.93.21-1.86.32-2.78.32-.93 0-1.73-.09-2.42-.26-.68-.18-1.25-.43-1.72-.77-.46-.34-.8-.77-1.04-1.29-.23-.53-.35-1.13-.35-1.81 0-.67.12-1.27.35-1.8.24-.53.58-.96 1.04-1.29.47-.33 1.04-.59 1.72-.76.69-.18 1.49-.26 2.42-.26.77 0 1.51.07 2.21.22.7.14 1.32.35 1.88.61.56.27 1.02.6 1.38.99.36.39.59.83.7 1.33h-3.42c-.07-.18-.19-.33-.35-.46-.16-.12-.35-.22-.57-.29-.22-.07-.47-.12-.74-.15-.27-.03-.55-.04-.84-.04-.43 0-.8.04-1.11.11-.31.07-.57.19-.77.35-.2.16-.35.36-.44.61-.1.24-.15.53-.15.86 0 .33.05.62.15.86.1.24.25.44.44.61.21.16.46.28.77.35.31.07.68.11 1.11.11.29 0 .57-.01.84-.04.27-.03.52-.08.74-.15.22-.07.41-.17.57-.29.16-.13.28-.28.35-.46h3.42c-.11.5-.34.94-.7 1.33-.36.39-.82.72-1.38.99-.56.27-1.18.47-1.88.61-.7.14-1.44.22-2.21.22-.93 0-1.86-.11-2.78-.32-.92-.21-1.82-.51-2.65-.9-.57-.274-1.06-.551-1.56-.861.09-.367.33-.676 1.11-.662h10.02z" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-gray-700">Paypal</span>
          </div>

          {selectedMethod === "paypal" ? (
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-orange-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full border border-gray-300"></div>
          )}
        </div>

        <div className="w-full h-px bg-gray-200"></div>

        {/* Amazon Pay */}
        <div
          className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
            selectedMethod === "amazon" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("amazon")}
        >
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-3">
              <div className="w-8 h-8 flex items-center justify-center text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M14.63 5.92c-.31.02-.57.06-.77.13-.2.07-.36.17-.48.3-.12.13-.2.29-.25.48-.05.19-.07.42-.07.68 0 .27.03.51.08.73.05.22.13.41.24.57.11.16.25.3.42.41.17.11.37.2.6.27.23.07.49.12.78.15.29.03.61.05.96.05h.25v-.95h-.22c-.22 0-.41-.01-.57-.04-.16-.03-.29-.07-.4-.13-.11-.06-.19-.14-.24-.24-.05-.1-.08-.22-.08-.37 0-.15.03-.27.08-.37.05-.1.13-.18.24-.24.11-.06.24-.1.4-.13.16-.03.35-.04.57-.04h.22v-.95h-.25c-.35 0-.67.02-.96.05-.29.03-.55.08-.78.15-.23.07-.43.16-.6.27-.17.11-.31.25-.42.41-.11.16-.19.35-.24.57-.05.22-.08.46-.08.73 0 .26.02.49.07.68.05.19.13.35.25.48.12.13.28.23.48.3.2.07.46.11.77.13v-.95c-.17-.01-.31-.03-.42-.06-.11-.03-.2-.07-.27-.12-.07-.05-.11-.11-.14-.18-.03-.07-.04-.15-.04-.24 0-.09.01-.17.04-.24.03-.07.07-.13.14-.18.07-.05.16-.09.27-.12.11-.03.25-.05.42-.06v-.95zm-1.59 6.22c-.36.03-.66.08-.9.15-.24.07-.43.17-.57.3-.14.13-.24.29-.3.48-.06.19-.09.42-.09.68 0 .27.03.51.1.73.07.22.17.41.31.57.14.16.32.3.54.41.22.11.48.2.78.27.3.07.64.12 1.02.15.38.03.8.05 1.26.05h.32v-.95h-.29c-.29 0-.54-.01-.75-.04-.21-.03-.38-.07-.52-.13-.14-.06-.24-.14-.31-.24-.07-.1-.1-.22-.1-.37 0-.15.03-.27.1-.37.07-.1.17-.18.31-.24.14-.06.31-.1.52-.13.21-.03.46-.04.75-.04h.29v-.95h-.32c-.46 0-.88.02-1.26.05-.38.03-.72.08-1.02.15-.3.07-.56.16-.78.27-.22.11-.4.25-.54.41-.14.16-.24.35-.31.57-.07.22-.1.46-.1.73 0 .26.03.49.09.68.06.19.16.35.3.48.14.13.33.23.57.3.24.07.54.12.9.15v-.95c-.22-.01-.4-.03-.55-.06-.15-.03-.26-.07-.35-.12-.09-.05-.15-.11-.18-.18-.03-.07-.05-.15-.05-.24 0-.09.02-.17.05-.24.03-.07.09-.13.18-.18.09-.05.2-.09.35-.12.15-.03.33-.05.55-.06v-.95z" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-gray-700">Amazon Pay</span>
          </div>

          {selectedMethod === "amazon" ? (
            <div className="relative h-4 w-4">
              <div className="h-4 w-4 rounded-full bg-orange-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"></div>
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full border border-gray-300"></div>
          )}
        </div>

        <div className="w-full h-px bg-gray-200"></div>

        {/* Debit/Credit Card */}
        <div
          className={`w-full flex items-center justify-between p-4 cursor-pointer transition-all ${
            selectedMethod === "card" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("card")}
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
            <span className="text-sm text-gray-700">Debit/Credit Card</span>
          </div>

          {selectedMethod === "card" ? (
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
            selectedMethod === "cash" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("cash")}
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
            {selectedMethod === "cash" ? (
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

        {/* UPI ID Payment */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
            selectedMethod === "upi" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("upi")}
        >
          <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.5 19.5L19.5 4.5M12 4.5V19.5M4.5 12H19.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs text-gray-700 text-center mb-6">UPI ID Payment</span>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            {selectedMethod === "upi" ? (
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

        {/* Paypal */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
            selectedMethod === "paypal" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("paypal")}
        >
          <div className="w-8 h-8 flex items-center justify-center text-blue-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M7.996 0h8.008C19.763 0 22 2.239 22 5.997v12.006C22 21.761 19.761 24 16.004 24H7.996C4.237 24 2 21.761 2 18.003V5.997C2 2.239 4.239 0 7.996 0zm7.906 7.347c.78-.014 1.02.295 1.11.662-.51.31-.99.587-1.56.861-.83.4-1.73.7-2.65.9-.93.21-1.86.32-2.78.32-.93 0-1.73-.09-2.42-.26-.68-.18-1.25-.43-1.72-.77-.46-.34-.8-.77-1.04-1.29-.23-.53-.35-1.13-.35-1.81 0-.67.12-1.27.35-1.8.24-.53.58-.96 1.04-1.29.47-.33 1.04-.59 1.72-.76.69-.18 1.49-.26 2.42-.26.77 0 1.51.07 2.21.22.7.14 1.32.35 1.88.61.56.27 1.02.6 1.38.99.36.39.59.83.7 1.33h-3.42c-.07-.18-.19-.33-.35-.46-.16-.12-.35-.22-.57-.29-.22-.07-.47-.12-.74-.15-.27-.03-.55-.04-.84-.04-.43 0-.8.04-1.11.11-.31.07-.57.19-.77.35-.2.16-.35.36-.44.61-.1.24-.15.53-.15.86 0 .33.05.62.15.86.1.24.25.44.44.61.21.16.46.28.77.35.31.07.68.11 1.11.11.29 0 .57-.01.84-.04.27-.03.52-.08.74-.15.22-.07.41-.17.57-.29.16-.13.28-.28.35-.46h3.42c-.11.5-.34.94-.7 1.33-.36.39-.82.72-1.38.99-.56.27-1.18.47-1.88.61-.7.14-1.44.22-2.21.22-.93 0-1.86-.11-2.78-.32-.92-.21-1.82-.51-2.65-.9-.57-.274-1.06-.551-1.56-.861.09-.367.33-.676 1.11-.662h10.02z" />
            </svg>
          </div>
          <span className="text-xs text-gray-700 text-center mb-6">Paypal</span>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            {selectedMethod === "paypal" ? (
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

        {/* Amazon Pay */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
            selectedMethod === "amazon" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("amazon")}
        >
          <div className="w-8 h-8 flex items-center justify-center text-yellow-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M14.63 5.92c-.31.02-.57.06-.77.13-.2.07-.36.17-.48.3-.12.13-.2.29-.25.48-.05.19-.07.42-.07.68 0 .27.03.51.08.73.05.22.13.41.24.57.11.16.25.3.42.41.17.11.37.2.6.27.23.07.49.12.78.15.29.03.61.05.96.05h.25v-.95h-.22c-.22 0-.41-.01-.57-.04-.16-.03-.29-.07-.4-.13-.11-.06-.19-.14-.24-.24-.05-.1-.08-.22-.08-.37 0-.15.03-.27.08-.37.05-.1.13-.18.24-.24.11-.06.24-.1.4-.13.16-.03.35-.04.57-.04h.22v-.95h-.25c-.35 0-.67.02-.96.05-.29.03-.55.08-.78.15-.23.07-.43.16-.6.27-.17.11-.31.25-.42.41-.11.16-.19.35-.24.57-.05.22-.08.46-.08.73 0 .26.02.49.07.68.05.19.13.35.25.48.12.13.28.23.48.3.2.07.46.11.77.13v-.95c-.17-.01-.31-.03-.42-.06-.11-.03-.2-.07-.27-.12-.07-.05-.11-.11-.14-.18-.03-.07-.04-.15-.04-.24 0-.09.01-.17.04-.24.03-.07.07-.13.14-.18.07-.05.16-.09.27-.12.11-.03.25-.05.42-.06v-.95zm-1.59 6.22c-.36.03-.66.08-.9.15-.24.07-.43.17-.57.3-.14.13-.24.29-.3.48-.06.19-.09.42-.09.68 0 .27.03.51.1.73.07.22.17.41.31.57.14.16.32.3.54.41.22.11.48.2.78.27.3.07.64.12 1.02.15.38.03.8.05 1.26.05h.32v-.95h-.29c-.29 0-.54-.01-.75-.04-.21-.03-.38-.07-.52-.13-.14-.06-.24-.14-.31-.24-.07-.1-.1-.22-.1-.37 0-.15.03-.27.1-.37.07-.1.17-.18.31-.24.14-.06.31-.1.52-.13.21-.03.46-.04.75-.04h.29v-.95h-.32c-.46 0-.88.02-1.26.05-.38.03-.72.08-1.02.15-.3.07-.56.16-.78.27-.22.11-.4.25-.54.41-.14.16-.24.35-.31.57-.07.22-.1.46-.1.73 0 .26.03.49.09.68.06.19.16.35.3.48.14.13.33.23.57.3.24.07.54.12.9.15v-.95c-.22-.01-.4-.03-.55-.06-.15-.03-.26-.07-.35-.12-.09-.05-.15-.11-.18-.18-.03-.07-.05-.15-.05-.24 0-.09.02-.17.05-.24.03-.07.09-.13.18-.18.09-.05.2-.09.35-.12.15-.03.33-.05.55-.06v-.95z" />
            </svg>
          </div>
          <span className="text-xs text-gray-700 text-center mb-6">Amazon Pay</span>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            {selectedMethod === "amazon" ? (
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

        {/* Debit/Credit Card */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-4 cursor-pointer transition-all relative ${
            selectedMethod === "card" ? "bg-orange-50" : "hover:bg-gray-50"
          }`}
          onClick={() => handleMethodSelect("card")}
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
          <span className="text-xs text-gray-700 text-center mb-6">Debit/Credit Card</span>

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            {selectedMethod === "card" ? (
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

      {/* Card Details Form (only shown when card is selected) */}
      {selectedMethod === "card" && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
              Name on Card
            </label>
            <input
              type="text"
              id="nameOnCard"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expire Date
              </label>
              <input
                type="text"
                id="expireDate"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleContinue}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}

export default PaymentOptions
