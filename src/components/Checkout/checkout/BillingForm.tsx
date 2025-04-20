"use client"

import type React from "react"
import { useState, useEffect } from "react"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import Checkbox from "./ui/Checkbox"

interface BillingFormProps {
  onBillingDetailsSubmit: (billingDetails: BillingDetails) => void
}

export interface BillingDetails {
  firstName: string
  lastName: string
  companyName?: string
  address: string
  country: string
  state: string
  city: string
  zipCode: string
  email: string
  phoneNumber: string
  shipToDifferentAddress: boolean
}

const BillingForm: React.FC<BillingFormProps> = ({ onBillingDetailsSubmit }) => {
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: "",
    lastName: "",
    companyName: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
    shipToDifferentAddress: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({})
  const [isFormValid, setIsFormValid] = useState(false)

  // Validate form on input change
  useEffect(() => {
    validateForm()
  }, [billingDetails])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BillingDetails, string>> = {}
    let valid = true

    // Required fields
    if (!billingDetails.firstName.trim()) {
      newErrors.firstName = "First name is required"
      valid = false
    }

    if (!billingDetails.lastName.trim()) {
      newErrors.lastName = "Last name is required"
      valid = false
    }

    if (!billingDetails.address.trim()) {
      newErrors.address = "Address is required"
      valid = false
    }

    if (!billingDetails.country) {
      newErrors.country = "Country is required"
      valid = false
    }

    if (!billingDetails.state) {
      newErrors.state = "State is required"
      valid = false
    }

    if (!billingDetails.city) {
      newErrors.city = "City is required"
      valid = false
    }

    if (!billingDetails.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required"
      valid = false
    }

    // Email validation
    if (!billingDetails.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(billingDetails.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    // Phone validation
    if (!billingDetails.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
      valid = false
    }

    setErrors(newErrors)
    setIsFormValid(valid)
    return valid
  }

  const handleChange = (field: keyof BillingDetails, value: string | boolean) => {
    setBillingDetails((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onBillingDetailsSubmit(billingDetails)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-medium mb-4">Billing and Shipping Information</h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">User name</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <TextField
            placeholder="First name"
            className="flex-1"
            value={billingDetails.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
          />
          <TextField
            placeholder="Last name"
            className="flex-1"
            value={billingDetails.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Company Name (Optional)</label>
        <TextField
          placeholder=""
          value={billingDetails.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Address</label>
        <TextField
          placeholder=""
          value={billingDetails.address}
          onChange={(e) => handleChange("address", e.target.value)}
          error={errors.address}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Country</label>
          <SelectField
            value={billingDetails.country}
            onChange={(e) => handleChange("country", e.target.value)}
            options={[
              { value: "USA", label: "USA" },
              { value: "Canada", label: "Canada" },
              { value: "UK", label: "UK" },
              { value: "India", label: "India" },
              { value: "Australia", label: "Australia" },
            ]}
            placeholder="Select..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Region/State</label>
          <SelectField
            value={billingDetails.state}
            onChange={(e) => handleChange("state", e.target.value)}
            options={[
              { value: "California", label: "California" },
              { value: "Texas", label: "Texas" },
              { value: "New York", label: "New York" },
              { value: "Florida", label: "Florida" },
              { value: "Illinois", label: "Illinois" },
            ]}
            placeholder="Select..."
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">City</label>
          <SelectField
            value={billingDetails.city}
            onChange={(e) => handleChange("city", e.target.value)}
            options={[
              { value: "Los Angeles", label: "Los Angeles" },
              { value: "Houston", label: "Houston" },
              { value: "New York City", label: "New York City" },
              { value: "Chicago", label: "Chicago" },
              { value: "Miami", label: "Miami" },
            ]}
            placeholder="Select..."
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-sm text-gray-600 mb-1">Zip Code</label>
            <TextField
              placeholder=""
              value={billingDetails.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              error={errors.zipCode}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <TextField
            placeholder=""
            value={billingDetails.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
          <TextField
            placeholder=""
            value={billingDetails.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            error={errors.phoneNumber}
          />
        </div>
      </div>

      <div className="mt-4">
        <Checkbox
          label="Ship into different address"
          checked={billingDetails.shipToDifferentAddress}
          onChange={(e: { target: { checked: string | boolean } }) => handleChange("shipToDifferentAddress", e.target.checked)}
        />
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  )
}

export default BillingForm
