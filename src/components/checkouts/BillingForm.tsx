"use client"

import type React from "react"
import { useState, useEffect } from "react"
import TextField from "@/components/ui/TextField"
import { Country, State, City } from "country-state-city"

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
}

const BillingForm: React.FC<BillingFormProps> = ({ onBillingDetailsSubmit }) => {
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: "",
    lastName: "",
    companyName: "",
    address: "",
    country: "IN", // Default to India
    state: "",
    city: "",
    zipCode: "",
    email: "",
    phoneNumber: "",
  })
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({})
  const [touchedFields, setTouchedFields] = useState<Set<keyof BillingDetails>>(new Set())
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Load countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  // Update states when country changes
  useEffect(() => {
    if (billingDetails.country) {
      const countryStates = State.getStatesOfCountry(billingDetails.country) || []
      setStates(countryStates)
    } else {
      setStates([])
    }
  }, [billingDetails.country])

  // Update cities when state changes
  useEffect(() => {
    if (billingDetails.country && billingDetails.state) {
      const citiesData = City.getCitiesOfState(billingDetails.country, billingDetails.state) || []
      setCities(citiesData)
    } else {
      setCities([])
    }
  }, [billingDetails.country, billingDetails.state])

  // Validate form on input change, but only show errors for touched fields or after submission
  useEffect(() => {
    validateForm()
  }, [billingDetails, touchedFields, formSubmitted])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BillingDetails, string>> = {}
    let valid = true

    // Validate all fields but only show errors for touched fields or after form submission
    if (!billingDetails.firstName.trim()) {
      newErrors.firstName = "First name is required"
      valid = false
    }

    if (!billingDetails.lastName.trim()) {
      newErrors.lastName = "Last name is required"
      valid = false
    }

    if (!billingDetails.companyName?.trim()) {
      newErrors.companyName = "Address is required"
      valid = false
    }

    if (!billingDetails.address.trim()) {
      newErrors.address = "Landmark is required"
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

    // Filter errors to only show for touched fields or after form submission
    const filteredErrors: Partial<Record<keyof BillingDetails, string>> = {}
    Object.keys(newErrors).forEach((key) => {
      const fieldKey = key as keyof BillingDetails
      if (touchedFields.has(fieldKey) || formSubmitted) {
        filteredErrors[fieldKey] = newErrors[fieldKey]
      }
    })

    setErrors(filteredErrors)
    return valid
  }

  const handleChange = (field: keyof BillingDetails, value: string | boolean) => {
    setBillingDetails((prev) => ({ ...prev, [field]: value }))
    setTouchedFields((prev) => new Set(prev).add(field))
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value
    setBillingDetails((prev) => ({
      ...prev,
      country: countryCode,
      state: "", // Reset state when country changes
      city: "", // Reset city when country changes
    }))
    setTouchedFields((prev) => {
      const newTouched = new Set(prev)
      newTouched.add("country")
      return newTouched
    })
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value
    setBillingDetails((prev) => ({
      ...prev,
      state: stateCode,
      city: "", // Reset city when state changes
    }))
    setTouchedFields((prev) => {
      const newTouched = new Set(prev)
      newTouched.add("state")
      return newTouched
    })
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("city", e.target.value)
  }

  const handleBlur = (field: keyof BillingDetails) => {
    setTouchedFields((prev) => new Set(prev).add(field))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    const isValid = validateForm()
    if (isValid) {
      onBillingDetailsSubmit(billingDetails)
    } else {
      // Scroll to the first error
      const firstErrorField = document.querySelector(".text-red-500")
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  // Helper function to determine if we should show an error for a field
  const shouldShowError = (field: keyof BillingDetails) => {
    return errors[field] && (touchedFields.has(field) || formSubmitted)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-medium mb-4">Billing and Shipping Information</h2>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder="First name"
              value={billingDetails.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              onBlur={() => handleBlur("firstName")}
              error={shouldShowError("firstName") ? errors.firstName : undefined}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder="Last name"
              value={billingDetails.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              onBlur={() => handleBlur("lastName")}
              error={shouldShowError("lastName") ? errors.lastName : undefined}
            />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <TextField
          placeholder=""
          value={billingDetails.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
          onBlur={() => handleBlur("companyName")}
          error={shouldShowError("companyName") ? errors.companyName : undefined}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Landmark <span className="text-red-500">*</span>
        </label>
        <TextField
          placeholder=""
          value={billingDetails.address}
          onChange={(e) => handleChange("address", e.target.value)}
          onBlur={() => handleBlur("address")}
          error={shouldShowError("address") ? errors.address : undefined}
        />
      </div>

      {/* Country and State in one row */}
      <div className="mb-4">
        <div className="flex flex-row gap-3">
          <div className="w-1/2">
            <label className="block text-sm text-gray-600 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={billingDetails.country}
              onChange={handleCountryChange}
              onBlur={() => handleBlur("country")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select country...</option>
              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
            </select>
            {shouldShowError("country") && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-sm text-gray-600 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <select
              value={billingDetails.state}
              onChange={handleStateChange}
              onBlur={() => handleBlur("state")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select state...</option>
              {states.map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
            {shouldShowError("state") && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>
      </div>

      {/* City and Zip Code in one row */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <select
              value={billingDetails.city}
              onChange={handleCityChange}
              onBlur={() => handleBlur("city")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select city...</option>
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {shouldShowError("city") && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder=""
              value={billingDetails.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              onBlur={() => handleBlur("zipCode")}
              error={shouldShowError("zipCode") ? errors.zipCode : undefined}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <TextField
            placeholder=""
            value={billingDetails.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={shouldShowError("email") ? errors.email : undefined}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <TextField
            placeholder=""
            value={billingDetails.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            onBlur={() => handleBlur("phoneNumber")}
            error={shouldShowError("phoneNumber") ? errors.phoneNumber : undefined}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  )
}

export default BillingForm
