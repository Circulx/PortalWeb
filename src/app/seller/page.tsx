"use client"
import { useSearchParams } from "next/navigation"
import DashboardContent from "./dashboard-content"
import ProfilePage from "./profile/page"

// Main dashboard page component
export default function SellerDashboard() {
  const searchParams = useSearchParams()
  const showDashboard = searchParams.get("view") === "dashboard"

  // By default, show the Profile page content
  // Only show Dashboard if explicitly requested via ?view=dashboard
  return <div className="w-full max-w-7xl mx-auto">{showDashboard ? <DashboardContent /> : <ProfilePage />}</div>
}
