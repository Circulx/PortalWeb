"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Search,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"
import { OrderStatusUpdater } from "./order-status-updater"

// Define types for order data
interface OrderProduct {
  productId?: string
  product_id?: string
  seller_id: string
  title: string
  quantity: number
  price: number
  image_link?: string
}

interface BillingDetails {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  phoneNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface Order {
  _id: string
  orderId: string
  userId?: string
  products: OrderProduct[]
  allProducts?: OrderProduct[]
  billingDetails: BillingDetails
  totalAmount: number
  sellerSubtotal: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  createdAt: string
  updatedAt: string
  additionalNotes?: string
  warehouseSelected?: boolean
  logisticsSelected?: boolean
}

interface OrderSummary {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentTab, setCurrentTab] = useState("all")

  // Fetch orders function
  const fetchOrders = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch("/api/seller/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched seller orders:", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch orders")
      }

      if (!data.orders || !Array.isArray(data.orders)) {
        console.error("Invalid orders data:", data)
        setOrders([])
        setFilteredOrders([])
        setSummary({
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
        })
        return
      }

      setOrders(data.orders)
      setFilteredOrders(data.orders)
      setSummary(
        data.summary || {
          totalOrders: data.orders.length,
          totalRevenue: data.orders.reduce((sum: number, order: Order) => sum + order.sellerSubtotal, 0),
          pendingOrders: data.orders.filter((order: Order) =>
            ["pending", "processing"].includes(order.status.toLowerCase()),
          ).length,
          completedOrders: data.orders.filter((order: Order) =>
            ["delivered", "completed"].includes(order.status.toLowerCase()),
          ).length,
        },
      )

      if (data.orders.length === 0) {
        toast.info("No orders found for your products")
      } else {
        toast.success(`Found ${data.orders.length} orders containing your products`)
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err instanceof Error ? err.message : "Failed to load orders")
      toast.error("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Optimistically update the UI
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)),
      )

      // Update the database
      const response = await fetch("/api/seller/orders/update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status")
      }

      toast.success(`Order status updated to ${newStatus}`)

      // Refresh orders to get latest data
      fetchOrders(true)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status. Please try again.")

      // Revert the optimistic update
      fetchOrders(true)
    }
  }

  // Initial load
  useEffect(() => {
    fetchOrders()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Filter orders based on search term, status, and current tab
  useEffect(() => {
    let filtered = [...orders]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.products.some((product) => (product.title || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
          ((order.billingDetails?.firstName || "") + " " + (order.billingDetails?.lastName || ""))
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (order.billingDetails?.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => (order.status || "").toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply tab filter
    if (currentTab !== "all") {
      if (currentTab === "pending") {
        filtered = filtered.filter((order) => ["pending", "processing"].includes((order.status || "").toLowerCase()))
      } else if (currentTab === "shipped") {
        filtered = filtered.filter((order) => (order.status || "").toLowerCase() === "shipped")
      } else if (currentTab === "delivered") {
        filtered = filtered.filter((order) => ["delivered", "completed"].includes((order.status || "").toLowerCase()))
      } else if (currentTab === "cancelled") {
        filtered = filtered.filter((order) => (order.status || "").toLowerCase() === "cancelled")
      }
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, currentTab])

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    const statusUpper = (status || "").toUpperCase()
    if (statusUpper === "PENDING") return "bg-yellow-500"
    if (statusUpper === "PROCESSING") return "bg-blue-500"
    if (statusUpper === "SHIPPED") return "bg-purple-500"
    if (statusUpper === "DELIVERED" || statusUpper === "COMPLETED") return "bg-green-500"
    if (statusUpper === "CANCELLED") return "bg-red-500"
    return "bg-gray-500"
  }

  // Function to get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    const statusUpper = (status || "").toUpperCase()
    if (statusUpper === "PAID") return "bg-green-500"
    if (statusUpper === "PENDING") return "bg-yellow-500"
    if (statusUpper === "FAILED") return "bg-red-500"
    return "bg-gray-500"
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (e) {
      return "Invalid date"
    }
  }

  // Function to get customer name
  const getCustomerName = (billingDetails: BillingDetails) => {
    if (!billingDetails) return "Unknown Customer"

    const firstName = billingDetails.firstName || ""
    const lastName = billingDetails.lastName || ""

    if (!firstName && !lastName) return "Unknown Customer"
    return `${firstName} ${lastName}`.trim()
  }

  // Manual refresh function
  const handleRefresh = () => {
    fetchOrders(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your orders...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500 text-center">{error}</p>
        <Button onClick={() => fetchOrders()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage orders containing your products</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Package className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{summary.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">₹{summary.totalRevenue.toFixed(2)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-10 w-10 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <h3 className="text-2xl font-bold">{summary.pendingOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Package className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Orders</p>
                <h3 className="text-2xl font-bold">{summary.completedOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Product Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, product, or customer..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="all" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({summary.pendingOrders})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({summary.completedOrders})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab}>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {orders.length > 0
                      ? "Try adjusting your filters to see more orders"
                      : "You don't have any orders for your products yet"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Your Products</TableHead>
                        <TableHead>Your Amount</TableHead>
                        <TableHead>Total Order</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">{order.orderId.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4 text-muted-foreground" />
                              <div>
                                <div>{getCustomerName(order.billingDetails)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.billingDetails?.email || "N/A"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              {order.products.map((product, index) => (
                                <div key={index} className="text-sm">
                                  <div className="truncate font-medium">{product.title}</div>
                                  <div className="text-xs text-muted-foreground">Qty: {product.quantity}</div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">₹{order.sellerSubtotal.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{order.products.length} item(s)</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">₹{order.totalAmount.toFixed(2)}</div>
                            {order.allProducts && (
                              <div className="text-xs text-muted-foreground">
                                {order.allProducts.length} total items
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{order.paymentMethod || "N/A"}</span>
                              </div>
                              <Badge className={getPaymentStatusColor(order.paymentStatus || "pending")}>
                                {(order.paymentStatus || "PENDING").toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <OrderStatusUpdater
                              currentStatus={order.status}
                              orderId={order._id}
                              onStatusUpdate={handleStatusUpdate}
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/seller/orders/${order._id}`}>View Details</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
