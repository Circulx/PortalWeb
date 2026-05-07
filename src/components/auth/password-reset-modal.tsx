"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { ArrowLeft, Loader2 } from "lucide-react"
import { verifyEmailForReset, resetPassword } from "@/actions/password-reset"
import { validateEmail, isPasswordValid } from "@/lib/validation"
import { OTPVerification } from "./otp-verification"
import { useToast } from "@/hooks/use-toast"

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordResetModal({ isOpen, onClose, onSuccess }: PasswordResetModalProps) {
  const [step, setStep] = useState<"email" | "otp" | "password">("email")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // ✅ Only new addition: SSR-safe flag required for createPortal
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleBack = () => {
    if (step === "password") {
      setStep("otp")
      setError("")
    } else if (step === "otp") {
      setStep("email")
      setError("")
    } else {
      onClose()
      resetForm()
    }
  }

  const resetForm = () => {
    setStep("email")
    setEmail("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setIsLoading(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "Invalid email")
      setIsLoading(false)
      return
    }

    const result = await verifyEmailForReset(email)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    // Send OTP
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          type: "password-reset",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to send OTP")
        setIsLoading(false)
        return
      }

      setStep("otp")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    }

    setIsLoading(false)
  }

  const handleOTPSuccess = async () => {
    setStep("password")
    setError("")
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields")
      setIsLoading(false)
      return
    }

    const passwordValidation = isPasswordValid(newPassword)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "Invalid password")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const result = await resetPassword(email, newPassword)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    toast({
      title: "Success!",
      description: "Your password has been reset successfully. Please login with your new password.",
      variant: "default",
    })

    onSuccess()
    resetForm()
  }

  const handleClose = (open: boolean) => {
    if (!open && !isLoading) {
      onClose()
      resetForm()
    }
  }

  if (!isOpen || !mounted) return null

  // ✅ ONLY CHANGE: original JSX is 100% untouched, just wrapped in createPortal
  // so it renders into document.body instead of inside the sign-in modal's DOM tree.
  // This fixes the overlap without touching any logic, handlers, or UI.
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 py-12 z-[9999]">
      <div className="w-full max-w-md">
        {step === 'email' ? (
          <div className="space-y-6">
            <div className="relative">
              <button
                onClick={handleBack}
                className="absolute -left-4 top-0 text-muted-foreground hover:text-foreground transition-colors p-2"
                disabled={isLoading}
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center pt-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Reset Password</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-2">Enter your email to get started</p>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-10 px-4 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-lg text-sm"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-lg transition-all disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Next'
                )}
              </Button>
            </form>
          </div>
        ) : step === 'otp' ? (
          <OTPVerification
            email={email}
            type="password-reset"
            onSuccess={handleOTPSuccess}
            onBack={() => {
              setStep('email')
              setError('')
            }}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <button
                onClick={handleBack}
                className="absolute -left-4 top-0 text-muted-foreground hover:text-foreground transition-colors p-2"
                disabled={isLoading}
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-center pt-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Create New Password</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-2">Set a strong password for your account</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">New Password</label>
                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password"
                  showStrength={true}
                  name="newPassword"
                  id="newPassword"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Confirm Password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm new password"
                  showStrength={false}
                  name="confirmPassword"
                  id="confirmPassword"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-lg transition-all disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Password'
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}