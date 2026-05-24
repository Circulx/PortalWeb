'use client'

import type React from 'react'
import { useState } from 'react'
import { signIn } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { validateEmail } from '@/lib/validation'
import { Loader2, Eye, EyeOff, Shield, Lock, BarChart3 } from 'lucide-react'
import Image from 'next/image'

export function AdminLogin() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setPasswordError('')

    try {
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email')
        setIsSubmitting(false)
        return
      }

      if (!password || password.length === 0) {
        setPasswordError('Password is required')
        setIsSubmitting(false)
        return
      }

      const formData = new FormData()
      formData.append('email', email.toLowerCase())
      formData.append('password', password)
      formData.append('requiredRole', 'admin')

      const result = await signIn(formData)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.success) {
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Failed to login. Please try again.')
      setIsSubmitting(false)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'Complete Control',
      description: 'Manage orders, products, and customers with ease'
    },
    {
      icon: Lock,
      title: 'Secure Access',
      description: 'Enterprise-grade security for your business data'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track performance and insights instantly'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section */}
          <div className="space-y-8 order-2 lg:order-1">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-32 h-32">
                <Image
                  src="/logo1.webp"
                  alt="ind2b Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Welcome Section */}
            <div className="space-y-4 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-serif text-gray-800 leading-tight">
                Welcome to Admin Portal
              </h1>
              <p className="text-lg text-gray-700 font-serif italic">
                of ind2b
              </p>
            </div>

            {/* Tagline */}
            <div className="border-l-4 border-amber-700 pl-6 space-y-3">
              <p className="text-gray-700 italic font-light leading-relaxed">
                "Excellence in administration is the foundation of exceptional service. Manage with precision, deliver with care."
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-6">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <feature.icon className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
              {/* Form Header */}
              <div className="text-center space-y-2 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-serif text-gray-900">Admin Login</h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                    </div>
                    <Input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="admin@ind2b.com"
                      disabled={isSubmitting}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-900 placeholder:font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-600 mt-1.5">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      className="w-full h-11 pl-10 pr-12 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-900 placeholder:font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-600 mt-1.5">{passwordError}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !email ||
                    !password ||
                    emailError !== '' ||
                    passwordError !== ''
                  }
                  className="w-full h-11 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Accessing Portal...
                    </span>
                  ) : (
                    'Access Admin Portal'
                  )}
                </Button>
              </form>

              {/* Security Footer */}
              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-600 leading-relaxed">
                  This is a secure area. Unauthorized access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
