

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PerformanceCard } from "@/components/seller/performance-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Order {
  _id: string
  orderId: string
  orderNumber: string
  createdAt: string
  status: string
  customer: string
  customerCompany: string
  amount: number
  products: any[]
}

interface DailySales {
  date: string
  day: string
  sales: number
}

interface DashboardData {
  sellerName: string
  metrics: {
    totalProducts: number
    pendingProducts: number
    inventoryValue: number
    monthlySales: number
    pendingOrders: number
  }
  recentOrders: Order[]
  dailySales: DailySales[]
}

export function DashboardWrapper() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/seller/dashboard")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch dashboard data")
      }

      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const intervalId = setInterval(() => {
      fetchDashboardData()
    }, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "completed" || statusLower === "delivered") return "bg-green-100 text-green-800"
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-800"
    if (statusLower === "processing") return "bg-blue-100 text-blue-800"
    if (statusLower === "cancelled") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
        <p className="text-lg text-gray-600">Loading dashboard data...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading dashboard</h3>
          <p className="text-red-700 mb-4 text-sm">{error}</p>
          <Button onClick={() => {
            setError(null)
            setLoading(true)
            fetchDashboardData()
          }} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {data?.sellerName}</h1>
          <p className="text-gray-600">Here&apos;s your Seller Performance summary for this Month</p>
        </div>
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PerformanceCard
          icon={<Package className="h-6 w-6 text-blue-600" />}
          label="Products Listed"
          value={data?.metrics.totalProducts.toString() || "0"}
        />
        <PerformanceCard
          icon={<ShoppingCart className="h-6 w-6 text-orange-600" />}
          label="Orders Pending"
          value={data?.metrics.pendingOrders.toString() || "0"}
        />
        <PerformanceCard
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          label="Inventory Value"
          value={`₹${(data?.metrics.inventoryValue || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          prefix=""
        />
        <PerformanceCard
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          label="Monthly Sales"
          value={formatCurrency(data?.metrics.monthlySales || 0)}
          prefix=""
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    try {
                      router.push("/seller/orders")
                    } catch (e) {
                      console.error("[v0] Navigation error:", e)
                    }
                  }}
                >
                  View All
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ORDER #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">PRODUCT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">CUSTOMER</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">STATUS</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">AMOUNT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.recentOrders && Array.isArray(data.recentOrders) && data.recentOrders.length > 0 ? (
                      data.recentOrders.map((order) => {
                        const productTitle = Array.isArray(order.products) && order.products.length > 0 
                          ? order.products[0].title 
                          : "Product"
                        const moreCount = Array.isArray(order.products) ? order.products.length - 1 : 0
                        return (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-medium">{order.orderNumber}</td>
                            <td className="px-4 py-4 text-sm">{productTitle}{moreCount > 0 && ` +${moreCount} more`}</td>
                            <td className="px-4 py-4 text-sm">{order.customer}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm font-medium">{formatCurrency(order.amount || 0)}</td>
                            <td className="px-4 py-4 text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  try {
                                    router.push(`/seller/orders`)
                                  } catch (e) {
                                    console.error("[v0] Navigation error:", e)
                                  }
                                }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No recent orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Sales Trend</h2>
                <p className="text-xs text-gray-500 mt-1">This Week</p>
              </div>

              <div className="p-4 h-[350px] flex items-center justify-center">
                {data?.dailySales && Array.isArray(data.dailySales) && data.dailySales.length > 0 ? (
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.dailySales} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                        <Line type="monotone" dataKey="sales" stroke="#f97316" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No sales data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

