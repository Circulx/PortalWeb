"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SignInForm } from "./sign-in-form"
import { SignUpForm } from "./sign-up-form"
import { ArrowLeft } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")

  const handleBack = () => {
    if (!isSignIn) {
      setIsSignIn(true)
    } else {
      onClose()
    }
    setSuccessMessage("")
  }

  const handleSignUpSuccess = (message: string) => {
    setSuccessMessage(message)
    setIsSignIn(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-[#004D41] border-0">
        <div className="px-14 py-3 relative">
          <button onClick={handleBack} className="absolute top-2 left-2 text-white hover:text-gray-200">
            <ArrowLeft size={24} />
          </button>
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {isSignIn ? (
            <SignInForm onSuccess={onSuccess} onSignUp={() => setIsSignIn(false)} />
          ) : (
            <SignUpForm onSuccess={handleSignUpSuccess} onSignIn={() => setIsSignIn(true)} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

