"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import BillingForm from "./BillingForm"
import PaymentOptions from "./paymentOptions"
import OrderSummary from "./OrderSummary"
import WarehouseSelection from "./WarehouseSelection"
import LogisticsSelection from "./LogisticsSelection"
import type { BillingDetails } from "./BillingForm"
import type { PaymentMethod } from "./paymentOptions"
import AdditionalInfo from "./AdditionalInfo"

// Define checkout steps
enum CheckoutStep {
  BILLING = 1,
  WAREHOUSE = 2,
  LOGISTICS = 3,
  PAYMENT = 4,
  ADDITIONAL_INFO = 5,
}

export default function CheckoutPage() {
  const router = useRouter()
  const cartItems = useSelector((state: RootState) => state.cart.items)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.BILLING)
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [warehouseNeeded, setWarehouseNeeded] = useState(false)
  const [logisticsNeeded, setLogisticsNeeded] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
  const [selectedLogistics, setSelectedLogistics] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [totalAmount, setTotalAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart")
    }
  }, [cartItems, router])

  // Handle billing details submission
  const handleBillingDetailsSubmit = (details: BillingDetails, warehouse: boolean, logistics: boolean) => {
    setBillingDetails(details)
    setWarehouseNeeded(warehouse)
    setLogisticsNeeded(logistics)

    // Determine next step based on selections
    if (warehouse) {
      setCurrentStep(CheckoutStep.WAREHOUSE)
    } else if (logistics) {
      setCurrentStep(CheckoutStep.LOGISTICS)
    } else {
      setCurrentStep(CheckoutStep.PAYMENT)
    }
    window.scrollTo(0, 0)
  }

  // Handle warehouse selection
  const handleWarehouseSelect = (warehouseId: string | null) => {
    setSelectedWarehouse(warehouseId)

    // If logistics is also needed, go to logistics step, otherwise go to payment
    if (logisticsNeeded) {
      setCurrentStep(CheckoutStep.LOGISTICS)
    } else {
      setCurrentStep(CheckoutStep.PAYMENT)
    }
    window.scrollTo(0, 0)
  }

  // Handle logistics selection
  const handleLogisticsSelect = (logisticsId: string | null) => {
    setSelectedLogistics(logisticsId)
    setCurrentStep(CheckoutStep.PAYMENT)
    window.scrollTo(0, 0)
  }

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setCurrentStep(CheckoutStep.ADDITIONAL_INFO)
    window.scrollTo(0, 0)
  }

  // Handle additional info submission
  const handleAdditionalInfoSubmit = (notes: string) => {
    setAdditionalNotes(notes)
    handlePlaceOrder()
    window.scrollTo(0, 0)
  }

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!billingDetails || !paymentMethod) {
      return
    }

    setIsProcessing(true)

    try {
      // Here you would typically send the order to your backend
      // Include selected warehouse and logistics if applicable
      const orderData = {
        billingDetails,
        paymentMethod,
        additionalNotes,
        warehouseId: warehouseNeeded ? selectedWarehouse : null,
        logisticsId: logisticsNeeded ? selectedLogistics : null,
      }

      console.log("Order data:", orderData)

      // Simulate API call
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
    <div className="max-w-7xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-center mb-8">Shopping Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main checkout content - takes 2/3 of the space */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Information */}
          <div className={`transition-opacity duration-300 ${currentStep !== CheckoutStep.BILLING && "opacity-60"}`}>
            <BillingForm onBillingDetailsSubmit={handleBillingDetailsSubmit} />
          </div>

          {/* Warehouse Selection - only shown if warehouse is needed */}
          {warehouseNeeded && (
            <div
              className={`transition-opacity duration-300 ${
                currentStep !== CheckoutStep.WAREHOUSE &&
                (currentStep < CheckoutStep.WAREHOUSE ? "opacity-50" : "opacity-60")
              }`}
            >
              <WarehouseSelection
                onWarehouseSelect={handleWarehouseSelect}
                disabled={currentStep !== CheckoutStep.WAREHOUSE}
              />
            </div>
          )}

          {/* Logistics Selection - only shown if logistics is needed */}
          {logisticsNeeded && (
            <div
              className={`transition-opacity duration-300 ${
                currentStep !== CheckoutStep.LOGISTICS &&
                (currentStep < CheckoutStep.LOGISTICS ? "opacity-50" : "opacity-60")
              }`}
            >
              <LogisticsSelection
                onLogisticsSelect={handleLogisticsSelect}
                disabled={currentStep !== CheckoutStep.LOGISTICS}
              />
            </div>
          )}

          {/* Payment Options */}
          <div
            className={`transition-opacity duration-300 ${
              currentStep !== CheckoutStep.PAYMENT && (currentStep < CheckoutStep.PAYMENT ? "opacity-50" : "opacity-60")
            }`}
          >
            <PaymentOptions
              onPaymentMethodSelect={handlePaymentMethodSelect}
              disabled={currentStep !== CheckoutStep.PAYMENT}
            />
          </div>

          {/* Additional Information */}
          <div
            className={`transition-opacity duration-300 ${
              currentStep !== CheckoutStep.ADDITIONAL_INFO &&
              (currentStep < CheckoutStep.ADDITIONAL_INFO ? "opacity-50" : "opacity-60")
            }`}
          >
            <AdditionalInfo
              onSubmit={handleAdditionalInfoSubmit}
              disabled={currentStep !== CheckoutStep.ADDITIONAL_INFO}
            />
          </div>
        </div>

        {/* Order Summary - takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 pt-4">
            <OrderSummary
              onPlaceOrder={handlePlaceOrder}
              onTotalAmountChange={handleTotalAmountChange}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
