

"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Package, ShoppingCart, AlertCircle } from "lucide-react"

interface DashboardData {
  success: boolean
  sellerName: string
  metrics: {
    totalProducts: number
    pendingProducts: number
    inventoryValue: number
    monthlySales: number
    pendingOrders: number
  }
  recentOrders: Array<{
    _id: string
    orderId: string
    orderNumber: string
    status: string
    productTitle: string
    customer: string
    amount: number
    paymentStatus: string
  }>
  dailySales: Array<{
    date: string
    day: string
    sales: number
  }>
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
}

function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === "number" && title.includes("Sale") ? `₹${value.toLocaleString()}` : value}
          </h3>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-gray-100 rounded-lg text-gray-600">{icon}</div>
      </div>
    </Card>
  )
}

export function DashboardWrapper() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/seller/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const dashboardData: DashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        console.error("[v0] Error fetching dashboard:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 text-sm">{error || "Failed to load dashboard data"}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {data.sellerName}!</h1>
        <p className="text-gray-600 text-sm mt-1">Here&apos;s your sales performance for this month</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Sales"
          value={data.metrics.monthlySales}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+12% from last month"
          trendUp={true}
        />
        <MetricCard
          title="Total Products"
          value={data.metrics.totalProducts}
          icon={<Package className="w-6 h-6" />}
          trend={`${data.metrics.pendingProducts} pending approval`}
        />
        <MetricCard
          title="Inventory Value"
          value={data.metrics.inventoryValue}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="Stock value"
        />
        <MetricCard
          title="Pending Orders"
          value={data.metrics.pendingOrders}
          icon={<AlertCircle className="w-6 h-6" />}
          trend="Awaiting shipment"
          trendUp={data.metrics.pendingOrders === 0}
        />
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        <Card className="overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{order.productTitle}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                      No orders yet. Your orders will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      {data.dailySales && data.dailySales.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales This Week</h2>
          <Card className="p-6 border border-gray-200">
            <div className="flex items-end justify-around h-64 gap-2">
              {data.dailySales.map((day) => (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-500 rounded-t hover:opacity-80 transition-opacity"
                    style={{
                      height: `${Math.max((day.sales / Math.max(...data.dailySales.map((d) => d.sales)) || 1) * 100, 5)}%`,
                    }}
                    title={`₹${day.sales.toLocaleString()}`}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">{day.day}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

