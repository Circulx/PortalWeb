"use client"

import { useState } from "react"
import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContactModal } from "./contact-modal"

interface SignUpFormProps {
  onSuccess: (message: string) => void
  onSignIn: () => void
}

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<"support" | "customer-care">("support")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl px-12 py-0.5 font-semibold text-white">Register Now</h1>
        <p className="text-gray-400 px-14"></p>
      </div>
      <form action={handleSubmit} className="space-y-2">
        <div>
          <p className="text-gray-50 px-1 py-1">Full Name</p>
          <Input id="name" name="name" required className="h-9 px-8 bg-white text-black  rounded-lg" />
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
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
          disabled={isLoading}
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
