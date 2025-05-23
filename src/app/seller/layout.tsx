"use client"

import type React from "react"
import { Sidebar } from "@/components/seller/sidebar"
import { Header } from "@/components/seller/header"
import AuthWrapper from "@/components/auth/auth-wrapper"

// Layout component that wraps all seller dashboard pages
export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper requiredRole="seller">
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthWrapper>
  )
}
