'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { signUp } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContactModal } from './contact-modal'
import { OTPVerification } from './otp-verification'
import { useSearchParams } from 'next/navigation'
import { validateEmail } from '@/lib/validation'
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface SignUpFormProps {
  onSuccess: (message: string) => void
  onSignIn: () => void
}

export function SignUpForm({ onSuccess, onSignIn }: SignUpFormProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<'support' | 'customer-care'>('support')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details')
  const [isResending, setIsResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const searchParams = useSearchParams()





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

  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[0-9]{10,15}$/
    return phoneRegex.test(phoneNumber.replace(/\D/g, ''))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(value)
    setPhoneError('')

    if (value && !validatePhone(value)) {
      setPhoneError('Phone number must be 10 digits')
    }
  }

  const validatePassword = (pwd: string): { isValid: boolean; error?: string } => {
    if (!pwd) return { isValid: true }
    if (pwd.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' }
    }
    const hasLetter = /[a-zA-Z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)

    if (!hasLetter || !hasNumber || !hasSpecial) {
      return { isValid: false, error: 'Password must contain letters, numbers, and special characters' }
    }
    return { isValid: true }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setPasswordError('')

    if (value) {
      const validation = validatePassword(value)
      if (!validation.isValid) {
        setPasswordError(validation.error || '')
      }
    }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || '')
        setIsLoading(false)
        return
      }

      if (!validatePhone(phone)) {
        setPhoneError('Phone number must be 10 digits')
        setIsLoading(false)
        return
      }

      if (!fullName.trim()) {
        setError('Full name is required')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          type: 'signup',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP')
        setIsLoading(false)
        return
      }

      setStep('otp')
      setIsLoading(false)
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  async function handleOTPSuccess() {
    console.log('[v0] OTP verified, starting account creation immediately')
    setError('')
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('name', fullName)
      formData.append('email', email.toLowerCase())
      formData.append('phone', phone)
      formData.append('userType', 'customer')
      formData.append('password', password)

      console.log('[v0] Creating account with data:', {
        name: fullName,
        email: email.toLowerCase(),
        phone,
        userType: 'customer'
      })

      const result = await signUp(formData)

      console.log('[v0] Account creation result:', result)

      if (result?.error) {
        console.error('[v0] Error from signUp action:', result.error)
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (!result?.success) {
        console.error('[v0] SignUp did not return success')
        setError('Account creation failed. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('[v0] Account created successfully!')
      setIsLoading(false)
      setStep('success')
      
      // Notify parent to show success message
      setTimeout(() => {
        onSuccess('Account created successfully! Please sign in.')
      }, 100)
    } catch (err) {
      console.error('[v0] Exception during account creation:', err)
      setError('Failed to create account. Please try again.')
      setIsLoading(false)
    }
  }

  const handleContactClick = (type: 'support' | 'customer-care') => {
    setContactType(type)
    setShowContactModal(true)
  }

  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        type="signup"
        onSuccess={handleOTPSuccess}
        onBack={() => {
          setStep('details')
          setError('')
        }}
      />
    )
  }

  if (step === 'success') {
    return (
      <div className="space-y-4 w-full text-center">
        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Account Created!</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">Your account has been successfully created.</p>
        <Button
          onClick={onSignIn}
          className="w-full h-9 text-xs sm:text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-md transition-all"
        >
          Go to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create Account</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Join our marketplace today</p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSendOTP} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Full Name</label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder=""
            disabled={isLoading}
            className="w-full h-9 px-3 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder=""
            disabled={isLoading}
            className="w-full h-9 px-3 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
          />
          {emailError && <p className="text-xs text-destructive mt-0.5">{emailError}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">We&apos;ll send a verification code</p>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Phone Number</label>
          <Input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder=""
            disabled={isLoading}
            maxLength={10}
            className="w-full h-9 px-3 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
          />
          {phoneError && <p className="text-xs text-destructive mt-0.5">{phoneError}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">10 digits required</p>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Password </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder=""
              disabled={isLoading}
              className="w-full h-9 px-3 pr-9 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {passwordError && <p className="text-xs text-destructive mt-0.5">{passwordError}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">Min 8 chars: letters, numbers & special chars</p>
        </div>



        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md text-xs text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={
            isLoading ||
            !fullName ||
            !email ||
            !phone ||
            emailError !== '' ||
            phoneError !== ''
          }
          className="w-full h-9 text-xs sm:text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-md transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground mt-4">
        Already have an account?{' '}
        <button
          onClick={onSignIn}
          disabled={isLoading}
          className="text-primary hover:text-accent font-semibold transition-colors"
        >
          Sign in
        </button>
      </div>

      <div className="flex justify-center gap-3 text-xs text-muted-foreground">
        <button
          onClick={() => handleContactClick('support')}
          disabled={isLoading}
          className="hover:text-foreground transition-colors"
        >
          Support
        </button>
        <span className="text-border">•</span>
        <button
          onClick={() => handleContactClick('customer-care')}
          disabled={isLoading}
          className="hover:text-foreground transition-colors"
        >
          Customer Care
        </button>
      </div>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        type={contactType}
      />
    </div>
  )
}
