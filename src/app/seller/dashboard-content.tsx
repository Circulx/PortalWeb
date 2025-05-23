import type { ReactNode } from "react"
import { Package2, ClipboardList, Wallet, TrendingUp, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SalesChart } from "@/components/seller/sales-chart"
import { Button } from "@/components/ui/button"

interface PerformanceCardProps {
  icon: ReactNode
  label: string
  value: string | number
  prefix?: string
}

function PerformanceCard({ icon, label, value, prefix = "" }: PerformanceCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <div className="bg-gray-100 rounded-full p-3">{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-semibold">
            {prefix}
            {value}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default function DashboardContent() {
  const orders = [
    { id: "1234", product: "Scrap Paper", customer: "ABC Industries", status: "Completed", amount: "₹25,000" },
    { id: "1235", product: "Glass Sheets", customer: "XYZ Pvt Ltd", status: "Completed", amount: "₹45,000" },
    { id: "1236", product: "Aluminum Scrap", customer: "GHI Enterprises", status: "Pending", amount: "₹35,000" },
    { id: "1237", product: "Scrap Paper", customer: "A.P Industries", status: "Completed", amount: "₹22,000" },
    { id: "1238", product: "Aluminum Scrap", customer: "Amiya Industries", status: "Pending", amount: "₹55,000" },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome, Ranjesh Roy</h1>
        <p className="text-sm text-gray-600">Here's your Seller Performance summary for this Month</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceCard icon={<Package2 className="h-6 w-6 text-blue-600" />} label="Products Listed" value="120" />
        <PerformanceCard
          icon={<ClipboardList className="h-6 w-6 text-green-600" />}
          label="Orders Pending"
          value="15"
        />
        <PerformanceCard
          icon={<Wallet className="h-6 w-6 text-yellow-600" />}
          label="Inventory Value"
          value="2,50,000"
          prefix="₹"
        />
        <PerformanceCard
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          label="Monthly Sales"
          value="1,50,000"
          prefix="₹"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders Section */}
        <Card className="overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h2 className="text-lg font-semibold mb-2 sm:mb-0">Recent Orders</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm">
                  Share
                </Button>
                <Button variant="ghost" size="sm">
                  Filter
                </Button>
                <Button variant="ghost" size="sm">
                  Export
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order #
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.product}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 text-right">
              <Button variant="outline" size="sm">
                View All Orders <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sales Trends Section */}
        <Card className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-semibold mb-2 sm:mb-0">Sales Trend</h2>
            <select className="text-sm border rounded px-2 py-1">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 sm:h-80">
            <SalesChart />
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue this month:</span>
              <span className="text-sm font-semibold">₹1,50,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top Product:</span>
              <span className="text-sm font-semibold">Aluminum Scrap</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Top Product Revenue:</span>
              <span className="text-sm font-semibold">₹50,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Least Revenue Product:</span>
              <span className="text-sm font-semibold">Glass Sheets</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Least Revenue:</span>
              <span className="text-sm font-semibold">₹10,000</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
