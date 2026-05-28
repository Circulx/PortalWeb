import type React from "react"
import { Sidebar } from "@/components/seller/sidebar"
import { Header } from "@/components/seller/header"
import AuthWrapper from "@/components/auth/auth-wrapper"

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper requiredRole="seller">
      <div className="flex min-h-screen bg-white text-gray-900">
        {/* Fixed Sidebar - Always visible on desktop, toggleable on mobile */}
        <Sidebar isMobileMenuOpen={false} setIsMobileMenuOpen={function (open: boolean): void {
          throw new Error("Function not implemented.")
        } } />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Header />
          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-y-auto bg-white text-gray-900 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthWrapper>
  )
}