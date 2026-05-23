"use client"

import type React from "react"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The sidebar and layout is now handled by the root /admin/layout.tsx
  // This layout just passes children through
  return <>{children}</>
}
