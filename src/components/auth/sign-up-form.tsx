"use client"

import { useState } from "react"
import { signUp } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SignUpFormProps {
  onSuccess: (message: string) => void
  onSignIn: () => void
}

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg- px-2 text-gray-100">OR</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-[#1a0b2e]/50 border-[#1a0b2e] hover:bg-[#1a0b2e] p-0 h-8"
          >
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#1a0b2e]/50 border-[#1a0b2e] hover:bg-[#1a0b2e] p-0 h-8"
          >
            <img src="https://authjs.dev/img/providers/facebook.svg" alt="Facebook" className="w-6 h-6" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#1a0b2e]/50 border-[#1a0b2e] hover:bg-[#1a0b2e] p-0 h-8"
          >
            <img src="https://authjs.dev/img/providers/github.svg" alt="GitHub" className="w-6 h-6" />
          </Button>
        </div>
      </form>
      <div className="text-center text-sm text-gray-100">
        Already have an account?{" "}
        <button onClick={onSignIn} className="text-gray-100 hover:text-purple-300">
          Sign in
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-100">
        <a href="#" className="hover:text-gray-400">
          Terms & Conditions
        </a>
        <a href="#" className="hover:text-gray-400">
          Support
        </a>
        <a href="#" className="hover:text-gray-400">
          Customer Care
        </a>
      </div>
    </div>
  )
}
