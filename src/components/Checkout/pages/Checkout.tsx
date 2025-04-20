"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import BillingForm from "../checkout/BillingForm"
import PaymentOptions from "../checkout/paymentOptions"
import OrderSummary from "../checkout/OrderSummary"
import type { BillingDetails } from "../checkout/BillingForm"
import type { PaymentMethod } from "../checkout/paymentOptions"
import AdditionalInfo from "../checkout/AdditionalInfo"

export default function CheckoutPage() {
  const router = useRouter()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [currentStep, setCurrentStep] = useState(1)
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [emailSignup, setEmailSignup] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart")
    }
  }, [cartItems, router])

  const handleBillingDetailsSubmit = (details: BillingDetails) => {
    setBillingDetails(details)
    setCurrentStep(2)
    window.scrollTo(0, 0)
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setCurrentStep(3)
    window.scrollTo(0, 0)
  }

  const handleAdditionalInfoSubmit = (notes: string) => {
    setAdditionalNotes(notes)
    setCurrentStep(4)
    window.scrollTo(0, 0)
  }

  const handlePlaceOrder = async () => {
    if (!billingDetails || !paymentMethod) {
      return
    }

    setIsProcessing(true)

    try {
      // Here you would typically send the order to your backend
      // For now, we'll just simulate a successful order
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to a success page or show a success message
      router.push("/checkout/success")
    } catch (error) {
      console.error("Error placing order:", error)
      setIsProcessing(false)
    }
  }

  const handleTotalAmountChange = (amount: number) => {
    setTotalAmount(amount)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Information */}
          <div className={`transition-opacity duration-300 ${currentStep !== 1 && "opacity-60"}`}>
            <BillingForm onBillingDetailsSubmit={handleBillingDetailsSubmit} />
          </div>

          {/* Payment Options */}
          <div
            className={`transition-opacity duration-300 ${currentStep !== 2 && (currentStep < 2 ? "opacity-50" : "opacity-60")}`}
          >
            <PaymentOptions onPaymentMethodSelect={handlePaymentMethodSelect} disabled={currentStep < 2} />
          </div>

          {/* Additional Information */}
          <div
            className={`transition-opacity duration-300 ${currentStep !== 3 && (currentStep < 3 ? "opacity-50" : "opacity-60")}`}
          >
            <AdditionalInfo onSubmit={handleAdditionalInfoSubmit} disabled={currentStep < 3} />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            onPlaceOrder={handlePlaceOrder}
            onTotalAmountChange={handleTotalAmountChange}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  )
}
