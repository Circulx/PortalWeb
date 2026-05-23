"use client"

import { useSearchParams } from "next/navigation"
import DashboardContent from "../dashboard-content"
import ProfilePage from "../profile/page"

// Client component that uses useSearchParams
export function DashboardWrapper() {
  const searchParams = useSearchParams()
  const showDashboard = searchParams.get("view") === "dashboard" || !searchParams.get("view")

  return <div className="w-full max-w-7xl mx-auto">{showDashboard ? <DashboardContent /> : <ProfilePage />}</div>
}
