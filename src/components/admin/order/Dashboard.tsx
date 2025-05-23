"use client"
import { useState, useEffect } from "react"
import StatsSection from "./StatsSection"
import ChartsSection from "./ChartsSection"
import OrdersTable from "./OrdersTable"

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    // Update the last updated time every 15 seconds
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Dashboard</h1>
        <div className="text-sm text-muted-foreground flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <span>Real-time data • Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>
      <StatsSection />
      <ChartsSection />
      <OrdersTable />
    </div>
  )
}
