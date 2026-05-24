"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import AuthWrapper from "@/components/auth/auth-wrapper"
import { Menu, X } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isLoginPage = pathname === "/admin"

  // If it's the login page, render without sidebar
  if (isLoginPage) {
    return <div className="fixed inset-0 overflow-hidden">{children}</div>
  }

  // For all other pages, render with sidebar
  return (
    <AuthWrapper requiredRole="admin">
      <div className="min-h-screen bg-white relative">
        {/* Fixed Sidebar */}
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Mobile Menu Toggle Button - Visible only on mobile/tablet */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>

        {/* Main Content Area - Offset by sidebar width on desktop */}
        <main className="md:ml-64 min-h-screen overflow-y-auto p-4 md:p-8 bg-white text-gray-900">
          {children}
        </main>
      </div>
    </AuthWrapper>
  )
}
