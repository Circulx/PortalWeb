'use client'

import type React from 'react'
import { useState } from 'react'
import { signInWithOTP, getCurrentUser } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OTPVerification } from './otp-verification'
import { validateEmail } from '@/lib/validation'
import { Loader2 } from 'lucide-react'

interface AdminLoginFormProps {
  onSuccess: () => void
  setIsLoading: (isLoading: boolean) => void
}

export function AdminLoginForm({
  onSuccess,
  setIsLoading,
}: AdminLoginFormProps) {
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

      // Then check if user is admin
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        setError('Failed to retrieve user information')
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      if (currentUser.type !== 'admin') {
        setError('You do not have admin access. Only admin accounts can access this portal.')
        setIsSubmitting(false)
        setIsLoading(false)
        
        // Redirect to appropriate dashboard based on user role after a delay
        setTimeout(() => {
          if (currentUser.type === 'seller') {
            window.location.href = '/seller/profile'
          } else {
            window.location.href = '/dashboard'
          }
        }, 2000)
        return
      }

      // User is admin, success
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
        <h2 className="text-xl font-bold text-slate-100">Admin Login</h2>
        <p className="text-slate-400 text-sm mt-1">Enter your email to receive an OTP</p>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSendOTP} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-200 block mb-1">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder=""
            disabled={isSubmitting}
            className="w-full h-9 px-3 bg-slate-700/50 border border-slate-600 text-white placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/20 transition-all rounded-md text-xs sm:text-sm"
          />
          {emailError && (
            <p className="text-xs text-red-400 mt-0.5">{emailError}</p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            We&apos;ll send a 6-digit verification code
          </p>
        </div>

        {error && (
          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-md text-xs text-red-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !email || emailError !== ''}
          className="w-full h-9 text-xs sm:text-sm font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-md transition-all disabled:opacity-50"
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
      <p className="text-center text-xs text-slate-400 pt-2">
        Need help?{' '}
        <a href="mailto:support@example.com" className="text-white hover:underline">
          Contact support
        </a>
      </p>
    </div>
  )
}
