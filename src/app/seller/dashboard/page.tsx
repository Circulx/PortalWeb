import { Suspense } from "react"
import { DashboardWrapper } from "./dashboard-wrapper"

// Loading fallback
function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

// Main dashboard page component with Suspense boundary
export default function SellerDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardWrapper />
    </Suspense>
  )
}

