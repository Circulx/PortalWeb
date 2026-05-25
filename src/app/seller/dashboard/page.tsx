

import { Suspense } from "react"
import { DashboardWrapper } from "./dashboard-wrapper"

// Mark this page as dynamic since it uses useSearchParams
export const dynamic = "force-dynamic"

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

// Main dashboard page component
export default function SellerDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardWrapper />
    </Suspense>
  )
}

