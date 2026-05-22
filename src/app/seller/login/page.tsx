'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SellerLoginForm } from '@/components/auth/seller-login-form'
import { ArrowLeft } from 'lucide-react'

export default function SellerLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginSuccess = () => {
    setIsLoading(true)
    // AuthWrapper in seller/layout will handle the redirect after auth refresh
    window.location.href = '/seller/profile'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Portal Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">Seller Portal</h1>
            <p className="text-emerald-700">Manage your business</p>
          </div>

          {/* Login Form Container */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-emerald-100">
            <SellerLoginForm
              onSuccess={handleLoginSuccess}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Footer Info */}
          <p className="text-center text-emerald-700 text-xs mt-6">
            Only seller accounts can access this portal
          </p>
        </div>
      </div>
    </div>
  )
}
