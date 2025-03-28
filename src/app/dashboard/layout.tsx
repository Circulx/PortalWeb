import type React from "react"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      {/* Vertical Line */}
      <div className="hidden md:block w-px bg-gray-200" />
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50">{children}</main>
    </div>
  )
}

