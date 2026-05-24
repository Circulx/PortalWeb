

"use client"

import { useSearchParams } from "next/navigation"

export function DashboardWrapper() {
  const searchParams = useSearchParams()

  // Your existing logic here
  // Example:
  const tab = searchParams.get("tab")

  return (
    <div>
      {/* Existing dashboard UI */}
      <h1>Seller Dashboard</h1>

      {/* Example usage */}
      {tab && <p>Current Tab: {tab}</p>}
    </div>
  )
}

