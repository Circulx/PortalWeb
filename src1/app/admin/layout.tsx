"use client"

import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"
import AuthWrapper from "@/components/auth/auth-wrapper"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper requiredRole="admin">
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Static Sidebar - only for admin content area */}
          <aside className="w-64 bg-white border-r flex-shrink-0">
            <div className="sticky top-0 h-screen">
              <Sidebar />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-h-screen">{children}</main>
        </div>
      </div>
    </AuthWrapper>
  )
}
