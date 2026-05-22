'use client'

import type React from 'react'
import { useState } from 'react'
import { signInWithOTP, getCurrentUser } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OTPVerification } from './otp-verification'
import { validateEmail } from '@/lib/validation'
import { Loader2 } from 'lucide-react'

interface SellerLoginFormProps {
  onSuccess: () => void
  setIsLoading: (isLoading: boolean) => void
}

export function SellerLoginForm({
  onSuccess,
  setIsLoading,
}: SellerLoginFormProps) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError('')

    if (value) {
      const validation = validateEmail(value)
      if (!validation.isValid) {
        setEmailError(validation.error || '')
      }
    }
  }

  async function handleSendOTP(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setIsLoading(true)
    setError('')
    setEmailError('')

    try {
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email')
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          type: 'login',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP')
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      setStep('otp')
      setIsSubmitting(false)
      setIsLoading(false)
    } catch (err) {
      setError('Network error. Please try again.')
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  async function handleOTPSuccess() {
    setIsSubmitting(true)
    setIsLoading(true)
    setError('')

    try {
      // First, sign in with OTP
      const result = await signInWithOTP(email.toLowerCase())

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      // Then check if user is seller
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        setError('Failed to retrieve user information')
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      if (currentUser.type !== 'seller') {
        setError('You do not have seller access. Only seller accounts can access this portal.')
        setIsSubmitting(false)
        setIsLoading(false)
        
        // Redirect to appropriate dashboard based on user role after a delay
        setTimeout(() => {
          if (currentUser.type === 'admin') {
            window.location.href = '/admin'
          } else {
            window.location.href = '/dashboard'
          }
        }, 2000)
        return
      }

      // User is seller, success
      onSuccess()
    } catch (err) {
      setError('Failed to login. Please try again.')
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  // OTP Verification Step
  if (step === 'otp') {
    return (
      <div className="w-full">
        <OTPVerification
          email={email}
          type="login"
          onSuccess={handleOTPSuccess}
          onBack={() => {
            setStep('email')
            setError('')
          }}
          isLoading={isSubmitting}
        />
      </div>
    )
  }

  // Email Entry Step
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-emerald-900">Seller Login</h2>
        <p className="text-emerald-700 text-sm mt-1">Enter your email to receive an OTP</p>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSendOTP} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-emerald-900 block mb-1">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder=""
            disabled={isSubmitting}
            className="w-full h-9 px-3 bg-white border border-emerald-200 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all rounded-md text-xs sm:text-sm"
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-0.5">{emailError}</p>
          )}
          <p className="text-xs text-emerald-700 mt-0.5">
            We&apos;ll send a 6-digit verification code
          </p>
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !email || emailError !== ''}
          className="w-full h-9 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sending code...
            </span>
          ) : (
            'Send Verification Code'
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-emerald-700 pt-2">
        Need help?{' '}
        <a href="mailto:support@example.com" className="text-emerald-900 hover:underline font-medium">
          Contact support
        </a>
      </p>
    </div>
  )
}
