"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ContactModal } from "./contact-modal"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface SignUpFormProps {
  onSuccess: (message: string) => void
  onSignIn: () => void
}

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Full name can only contain letters, spaces, periods, apostrophes, and hyphens"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  gstNumber: z
    .string()
    .optional()
})

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<"support" | "customer-care">("support")
  const [userType, setUserType] = useState("customer")
  const [gstError, setGstError] = useState("")

  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gstNumber: ""
    }
  })

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

  const handleGSTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGstError("")

    if (value && !validateGSTNumber(value)) {
      setGstError("Invalid GST format. Example: 22AAAAA0000A1Z5")
    }
  }

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true)
    setError("")
    setGstError("")

    // Validate GST number for sellers before submission
    if (userType === "seller") {
      if (values.gstNumber && !validateGSTNumber(values.gstNumber)) {
        setGstError("Please enter a valid GST number")
        setIsLoading(false)
        return
      }
    }

    // Create FormData for the signUp action
    const formData = new FormData()
    formData.append("name", values.name)
    formData.append("email", values.email)
    formData.append("password", values.password)
    formData.append("userType", userType)
    if (values.gstNumber) {
      formData.append("gstNumber", values.gstNumber)
    }

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-gray-50 px-1 py-1">Full Name</FormLabel>
                <FormControl>
                  <FormInput {...field} className="h-9 px-8 bg-white text-black rounded-lg" />
                </FormControl>
                <FormMessage className="text-gray-200 px-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-gray-50 px-1 py-1">Email</FormLabel>
                <FormControl>
                  <FormInput
                    {...field}
                    type="email"
                    placeholder=""
                    className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
                  />
                </FormControl>
                <FormMessage className="text-gray-200 px-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-gray-50 px-1 py-1">Password</FormLabel>
                <FormControl>
                  <FormInput
                    {...field}
                    type="password"
                    placeholder=""
                    className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
                  />
                </FormControl>
                <FormMessage className="text-gray-200 px-1" />
              </FormItem>
            )}
          />
          {isSellerSignup && (
            <FormField
              control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-50 px-1 py-1">GST Number</FormLabel>
                  <FormControl>
                    <FormInput
                      {...field}
                      placeholder="22AAAAA0000A1Z5"
                      className="h-9 px-8 bg-white text-black placeholder:text-gray-500 rounded-lg"
                      onChange={(e) => {
                        field.onChange(e)
                        handleGSTChange(e)
                      }}
                      maxLength={15}
                    />
                  </FormControl>
                  {gstError && <p className="text-sm text-red-400 mt-1 px-1">{gstError}</p>}
                  <p className="text-xs text-gray-300 mt-1 px-1">Enter 15-character GST number</p>
                </FormItem>
              )}
            />
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </Form>
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