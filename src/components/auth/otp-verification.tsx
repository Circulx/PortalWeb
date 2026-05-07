"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2, Clock } from "lucide-react"

interface OTPVerificationProps {
  email: string
  type: "signup" | "login" | "password-reset"
  onSuccess: () => void
  onBack: () => void
  isLoading?: boolean
}

export function OTPVerification({
  email,
  type,
  onSuccess,
  onBack,
  isLoading = false,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setError("")
    setIsVerifying(true)

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpString,
          type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to verify OTP")
        setIsVerifying(false)
        return
      }

      setSuccess(true)
      setError("")

      // Wait a moment before calling onSuccess
      setTimeout(() => {
        onSuccess()
      }, 1000)
    } catch (err) {
      setError("Network error. Please try again.")
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to resend OTP")
        setIsResending(false)
        return
      }

      // Reset OTP and timer
      setOtp(["", "", "", "", "", ""])
      setTimeLeft(600)
      setCanResend(false)
      setIsResending(false)
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError("Network error. Please try again.")
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Verify Email</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-2">
          We&apos;ve sent a 6-digit code to{' '}
          <span className="font-semibold text-primary">{email}</span>
        </p>
      </div>

      {/* Success State */}
      {success && (
        <div className="p-2 bg-accent/10 border border-accent/30 rounded-md flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium text-accent">Email verified successfully!</p>
        </div>
      )}

      {/* Error State */}
      {error && !success && (
        <div className="p-2 bg-destructive/10 border border-destructive/30 rounded-md flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* OTP Input */}
      <div className="space-y-2">
        <p className="text-foreground text-xs font-medium">Enter 6-digit code</p>
        <div className="flex justify-center gap-1.5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={success || isLoading || isVerifying}
              className="w-9 h-9 sm:w-10 sm:h-10 text-center text-lg font-bold border-2 rounded-md transition-all
                border-border bg-input text-foreground
                focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30
                disabled:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground"
              placeholder="0"
            />
          ))}
        </div>
      </div>

      {/* Timer and Resend */}
      <div className="space-y-1.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            Code expires in:{' '}
            <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span>
          </span>
        </div>

        {canResend ? (
          <button
            onClick={handleResend}
            disabled={isResending || isLoading}
            className="text-primary hover:text-accent font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {isResending ? (
              <span className="flex items-center gap-1.5 justify-center">
                <Loader2 className="w-3 h-3 animate-spin" />
                Resending...
              </span>
            ) : (
              "Didn't receive the code? Resend"
            )}
          </button>
        ) : (
          <p className="text-xs text-muted-foreground">
            You can resend the code in {formatTime(timeLeft)}
          </p>
        )}
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        disabled={isVerifying || success || otp.some((d) => !d) || isLoading}
        className="w-full h-9 text-xs sm:text-sm font-semibold bg-primary hover:bg-accent text-primary-foreground rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Verifying...
          </span>
        ) : success ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Verified
          </span>
        ) : (
          'Verify Code'
        )}
      </Button>

      {/* Info Tip */}
      <div className="p-2 bg-primary/10 border border-primary/30 rounded-md">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Tip:</span> Check your spam folder if you
          don&apos;t see the email.
        </p>
      </div>
    </div>
  )
}
