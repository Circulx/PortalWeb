"use client"

import type React from "react"
import { useState } from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import AuthWrapper from "@/components/auth/auth-wrapper"
import { Menu, X } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <AuthWrapper requiredRole="customer">
      <div className="relative min-h-screen bg-white pt-20">
        {/* Toggle Button for Mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-20 right-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>

        {/* Fixed Sidebar */}
        <DashboardSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Main Content with offset for sidebar */}
        <main className="md:ml-64 min-h-screen p-4 md:p-8 bg-white text-gray-900">{children}</main>
      </div>
    </AuthWrapper>
  )
}
