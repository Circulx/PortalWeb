"use client"

import { useState } from "react"
import { signIn } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface SignInFormProps {
  onSuccess: () => void
  onSignUp: () => void
}

export function SignInForm({ onSuccess, onSignUp }: SignInFormProps) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

    const result = await signIn(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl px-20 font-semibold text-white">Login</h1>
        <p className="text-gray-200 px-16">Glad you're back!</p>
      </div>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <p className="text-gray-50 px-1 py-1">Email</p>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder=""
            className="h-9 px-8 bg-white text-white-100 placeholder:text-gray-500 rounded-lg"
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
            className="h-9 px-8 bg-white text-green placeholder:text-gray-500 rounded-lg"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" name="remember" className="border-gray-100 data-[state=checked]:bg-purple-600" />
          <label htmlFor="remember" className="text-sm text-gray-100">
            Remember me
          </label>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          className="w-full h-9 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>
        <div className="text-center ">
          <a href="#" className="text-sm text-gray-50 hover:text-white">
            Forgot password?
          </a>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-800"></span>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#1a0b2e] px-2 text-gray-500">Or</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-[#1a0b2e]/50 border-[#1a0b2e] hover:bg-[#1a0b2e] p-0 h-12"
          >
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#1a0b2e]/50 border-[#1a0b2e] hover:bg-[#1a0b2e] p-0 h-12"
          >
            <img src="https://authjs.dev/img/providers/facebook.svg" alt="Facebook" className="w-6 h-6" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#1a0b2e]/50 border-[#1a0b2e] hover:bg-[#1a0b2e] p-0 h-12"
          >
            <img src="https://authjs.dev/img/providers/github.svg" alt="GitHub" className="w-6 h-6" />
          </Button>
        </div>
      </form>
      <div className="text-center text-sm text-gray-200">
        Don't have an account?{" "}
        <button onClick={onSignUp} className="text-purple-400 hover:text-gray-200">
          Signup
        </button>
      </div>
      <div className="flex justify-between text-xs text-gray-200 py-2">
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

