'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLoginForm } from '@/components/auth/admin-login-form'
import { ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginSuccess = () => {
    setIsLoading(true)
    // AuthWrapper in admin/layout will handle the redirect after auth refresh
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
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
            <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-slate-300">Access the admin dashboard</p>
          </div>

          {/* Login Form Container */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 sm:p-8 shadow-2xl">
            <AdminLoginForm
              onSuccess={handleLoginSuccess}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Footer Info */}
          <p className="text-center text-slate-400 text-xs mt-6">
            Only admin accounts can access this portal
          </p>
        </div>
      </div>
    </div>
  )
}
