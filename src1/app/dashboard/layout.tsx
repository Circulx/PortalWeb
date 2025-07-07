"use client"

import type React from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import AuthWrapper from "@/components/auth/auth-wrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper requiredRole="customer">
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar />
        {/* Vertical Line */}
        <div className="hidden md:block w-px bg-gray-200" />
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50">{children}</main>
      </div>
    </AuthWrapper>
  )
}
