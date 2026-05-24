'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { signIn, signInWithOTP } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ContactModal } from './contact-modal'
import { OTPVerification } from './otp-verification'
import { PasswordResetModal } from './password-reset-modal'
import { useRouter } from 'next/navigation'
import { validateEmail } from '@/lib/validation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SignInFormProps {
  onSuccess: (user?: any) => void
  onSignUp: () => void
  setIsLoading: (isLoading: boolean) => void
}

export function SignInForm({ onSuccess, onSignUp, setIsLoading }: SignInFormProps) {
  const [authMethod, setAuthMethod] = useState<'password' | 'email-otp'>('password')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactType, setContactType] = useState<'support' | 'customer-care'>('support')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setPasswordError('')
  }

  async function handlePasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setIsLoading(true)
    setError('')
    setPasswordError('')

    try {
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email')
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      if (!password || password.length === 0) {
        setPasswordError('Password is required')
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      const formData = new FormData()
      formData.append('email', email.toLowerCase())
      formData.append('password', password)
      formData.append('requiredRole', 'customer')

      const result = await signIn(formData)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      if (result.success && result.user) {
        onSuccess(result.user)
      } else {
        onSuccess()
      }

      router.refresh()
    } catch (err) {
      setError('Failed to login. Please try again.')
      setIsSubmitting(false)
      setIsLoading(false)
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

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
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
    try {
      const result = await signInWithOTP(email.toLowerCase(), 'customer')

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        setIsLoading(false)
        return
      }

      if (result.success && result.user) {
        onSuccess(result.user)
      } else {
        onSuccess()
      }

      router.refresh()
    } catch (err) {
      setError('Failed to login. Please try again.')
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
  }

  const handleContactClick = (type: 'support' | 'customer-care') => {
    setContactType(type)
    setShowContactModal(true)
  }

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false)
    toast({
      title: 'Password Reset',
      description: 'Your password has been reset successfully. Please login with your new password.',
      variant: 'default',
    })
  }

  // ─── OTP Step ───────────────────────────────────────────────────────────────
  // Rendered inside the same modal shell — no full-page wrapper
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

  // ─── Main Sign-In Form ───────────────────────────────────────────────────────
  return (
    // ✅ No min-h-screen, no full-page centering — the modal handles that.
    // This wrapper is purely for spacing and max-width constraint inside the modal.
    <div className="w-full space-y-4">

      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Sign in to your account</p>
      </div>

      {/* Auth Method Toggle */}
      <div className="flex gap-2 bg-secondary rounded-lg p-1">
        <button
          onClick={() => {
            setAuthMethod('password')
            setError('')
            setPassword('')
          }}
          className={`flex-1 py-2 px-3 rounded-md font-semibold transition-all text-xs sm:text-sm ${
            authMethod === 'password'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          disabled={isSubmitting}
        >
          Password
        </button>
        <button
          onClick={() => {
            setAuthMethod('email-otp')
            setError('')
            setPassword('')
            setPasswordError('')
          }}
          className={`flex-1 py-2 px-3 rounded-md font-semibold transition-all text-xs sm:text-sm ${
            authMethod === 'email-otp'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          disabled={isSubmitting}
        >
          Email OTP
        </button>
      </div>

      {/* ── Password Form ─────────────────────────────────────────────────────── */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="w-full h-9 px-3 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
            />
            {emailError && (
              <p className="text-xs text-destructive mt-0.5">{emailError}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full h-9 px-3 pr-9 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive mt-0.5">{passwordError}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                disabled={isSubmitting}
                className="w-4 h-4"
              />
              <label
                htmlFor="remember"
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-xs text-primary hover:text-accent font-medium transition-colors"
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md text-xs text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !email ||
              !password ||
              emailError !== '' ||
              passwordError !== ''
            }
            className="w-full h-9 text-xs sm:text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      )}

      {/* ── Email OTP Form ────────────────────────────────────────────────────── */}
      {authMethod === 'email-otp' && (
        <form onSubmit={handleSendOTP} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Email Address
            </label>
            <Input
              id="email-otp"
              name="email-otp"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="w-full h-9 px-3 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-md text-xs sm:text-sm"
            />
            {emailError && (
              <p className="text-xs text-destructive mt-0.5">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              A verification code will be sent to your email
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember-otp"
              checked={rememberMe}
              onCheckedChange={handleRememberMeChange}
              disabled={isSubmitting}
              className="w-4 h-4"
            />
            <label
              htmlFor="remember-otp"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>

          {error && (
            <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md text-xs text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !email || emailError !== ''}
            className="w-full h-9 text-xs sm:text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-md transition-all disabled:opacity-50"
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
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSignUp}
          disabled={isSubmitting}
          className="text-primary hover:text-accent font-semibold transition-colors"
        >
          Sign up
        </button>
      </div>

      <div className="flex justify-center gap-3 text-xs text-muted-foreground">
        <button
          onClick={() => handleContactClick('support')}
          disabled={isSubmitting}
          className="hover:text-foreground transition-colors"
        >
          Support
        </button>
        <span className="text-border">•</span>
        <button
          onClick={() => handleContactClick('customer-care')}
          disabled={isSubmitting}
          className="hover:text-foreground transition-colors"
        >
          Customer Care
        </button>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        type={contactType}
      />
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onSuccess={handlePasswordResetSuccess}
      />
    </div>
  )
}
