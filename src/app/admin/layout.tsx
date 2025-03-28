"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:h-[100vh]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar />
        </aside>

        {/* Backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen w-full lg:w-auto">{children}</main>
      </div>
    </div>
  )
}

