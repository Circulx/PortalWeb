"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContactModal } from "./contact-modal"
import { useSearchParams } from "next/navigation"

interface SignUpFormProps {
  onSuccess: (message: string) => void
  onSignIn: () => void
}

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<"support" | "customer-care">("support")
  const [userType, setUserType] = useState("customer")
  const [gstError, setGstError] = useState("")
  const [fullName, setFullName] = useState("")
  const [gstValue, setGstValue] = useState("")
  const [gstStatus, setGstStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "api-missing" | "error">(
    "idle",
  )
  const [gstHolderName, setGstHolderName] = useState<string | null>(null)
  const [gstHelper, setGstHelper] = useState<string>("")

  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is signing up as seller from URL params
    const type = searchParams.get("type")
    const pathname = window.location.pathname

    // Check both URL parameter and pathname for seller signup
    if (type === "seller" || pathname.includes("/seller")) {
      setUserType("seller")
    }
  }, [searchParams])

  // GST Number validation function
  const validateGSTNumber = (gstNumber: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanGST = gstNumber.replace(/\s/g, "").toUpperCase()

    // GST format: 2 digits (state code) + 10 alphanumeric (PAN) + 1 digit (entity number) + 1 alphabet (Z) + 1 alphanumeric (checksum)
    // Total 15 characters
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/

    return gstRegex.test(cleanGST)
  }

  // Checksum function (mirror of server, simplified here)
  const validateGSTChecksum = (gstNumber: string): boolean => {
    const gstin = (gstNumber || "").replace(/\s+/g, "").toUpperCase()
    if (gstin.length !== 15) return false
    const charToValue = (ch: string) => {
      const code = ch.charCodeAt(0)
      if (code >= 48 && code <= 57) return code - 48
      if (code >= 65 && code <= 90) return code - 55
      return -1
    }
    const valueToChar = (val: number) => {
      if (val >= 0 && val <= 9) return String.fromCharCode(48 + val)
      if (val >= 10 && val <= 35) return String.fromCharCode(55 + val)
      return ""
    }
    let sum = 0
    for (let i = 0; i < 14; i++) {
      const val = charToValue(gstin[i])
      if (val < 0) return false
      const weight = i % 2 === 0 ? 1 : 2
      const product = val * weight
      sum += Math.floor(product / 36) + (product % 36)
    }
    const checkVal = (36 - (sum % 36)) % 36
    const expected = valueToChar(checkVal)
    return expected === gstin[14]
  }

  const handleGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setGstValue(value)
    setGstError("")
    setGstHolderName(null)
    setGstHelper("")
    setGstStatus("idle")

    if (value && !validateGSTNumber(value)) {
      setGstError("Invalid GST format. Example: 22AAAAA0000A1Z5")
    }
  }

  useEffect(() => {
    if (userType !== "seller") return
    if (gstValue.length !== 15) return
    if (!validateGSTNumber(gstValue) || !validateGSTChecksum(gstValue)) {
      setGstStatus("invalid")
      setGstHelper("Invalid GST format/checksum")
      return
    }

    let active = true
    const timer = setTimeout(async () => {
      try {
        setGstStatus("checking")
        setGstHelper("Verifying GST with GST Network...")
        const res = await fetch("/api/gst/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gstin: gstValue }),
        })

        // 503 indicates missing provider config
        if (res.status === 503) {
          const data = await res.json()
          if (!active) return
          setGstStatus("api-missing")
          setGstHelper(data?.error || "GST verification service not configured.")
          setGstHolderName(null)
          return
        }

        const data = await res.json()
        if (!active) return

        if (data?.valid) {
          setGstStatus("valid")
          setGstHolderName(data?.legalName || data?.tradeName || null)
          setGstHelper("")
        } else {
          setGstStatus("invalid")
          setGstHolderName(null)
          setGstHelper(data?.error || "GST could not be verified. Please check and try again.")
        }
      } catch (e) {
        if (!active) return
        setGstStatus("error")
        setGstHolderName(null)
        setGstHelper("Unable to verify GST right now. Please try again.")
      }
    }, 400) // debounce

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [gstValue, userType])

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")
    setGstError("")

    // Validate GST number for sellers before submission
    if (userType === "seller") {
      const gstNumber = (formData.get("gstNumber") as string) || gstValue
      if (!gstNumber || !validateGSTNumber(gstNumber) || !validateGSTChecksum(gstNumber)) {
        setGstError("Please enter a valid GST number")
        setIsLoading(false)
        return
      }
      if (gstStatus !== "valid") {
        setGstError(
          gstStatus === "api-missing"
            ? "GST verification service is not configured. Please contact support."
            : "Please verify a valid GST before signing up.",
        )
        setIsLoading(false)
        return
      }
    }

    // Add user type to form data
    formData.append("userType", userType)

    const result = await signUp(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    onSuccess("User registered successfully. Please sign in.")
  }

  const handleContactClick = (type: "support" | "customer-care") => {
    setContactType(type)
    setShowContactModal(true)
  }

  const isSellerSignup = userType === "seller"

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl px-12 py-0.5 font-semibold text-white">
          {isSellerSignup ? "Register as Seller" : "Register Now"}
        </h1>
        <p className="text-gray-400 px-14"></p>
      </div>
      <form action={handleSubmit} className="space-y-2">
        <div>
          <p className="text-gray-50 px-1 py-1">Full Name</p>
          <Input
            id="name"
            name="name"
            required
            className="h-9 px-8 bg-white text-black  rounded-lg"
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <p className="text-gray-50 px-1 py-1">Email</p>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder=""
            className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
          />
        </div>
        <div>
          <p className="text-gray-50 px-1 py-1">Password</p>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder=""
            className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
          />
        </div>
        {isSellerSignup && (
          <div>
            <p className="text-gray-50 px-1 py-1">GST Number</p>
            <Input
              id="gstNumber"
              name="gstNumber"
              required
              placeholder="22AAAAA0000A1Z5"
              className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
              onChange={handleGSTChange}
              maxLength={15}
              value={gstValue}
            />
            <div className="mt-1 px-1 space-y-1">
              {fullName && (
                <p className="text-xs text-gray-200">
                  User Name: <span className="font-medium">{fullName}</span>
                </p>
              )}
              {gstStatus === "checking" && <p className="text-xs text-blue-200">Verifying GST…</p>}
              {gstStatus === "valid" && gstHolderName && (
                <p className="text-xs text-green-300">
                  GST Holder: <span className="font-semibold">{gstHolderName}</span>
                </p>
              )}
              {gstError && <p className="text-sm text-red-400">{gstError}</p>}
              {gstStatus === "invalid" && !gstError && (
                <p className="text-xs text-red-400">{gstHelper || "Invalid GST"}</p>
              )}
              {gstStatus === "api-missing" && (
                <p className="text-xs text-yellow-200">
                  {gstHelper || "GST verification service not configured. Contact support."}
                </p>
              )}
              {!gstError && !gstHelper && <p className="text-xs text-gray-300">Enter 15-character GST number</p>}
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
          disabled={isLoading || (isSellerSignup && gstStatus !== "valid")}
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <div className="text-center text-sm text-gray-100">
        Already have an account?{" "}
        <button onClick={onSignIn} className="text-gray-100 hover:text-purple-300">
          Sign in
        </button>
      </div>
      <div className="flex justify-center gap-8 text-xs text-gray-100">
        <button onClick={() => handleContactClick("support")} className="hover:text-gray-400 transition-colors">
          Support
        </button>
        <button onClick={() => handleContactClick("customer-care")} className="hover:text-gray-400 transition-colors">
          Customer Care
        </button>
      </div>
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} type={contactType} />
    </div>
  )
}
