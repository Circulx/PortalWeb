"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, Package, TrendingUp, DollarSign, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

// Define types for order data
interface OrderProduct {
  productId?: string
  product_id?: string
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
  userId?: string
  products: OrderProduct[]
  billingDetails: BillingDetails
  totalAmount: number
  sellerSubtotal: number
  originalTotal: number
  status: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentTab, setCurrentTab] = useState("all")

  // Stats
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const response = await fetch("/api/seller/orders")

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        console.log("Fetched orders:", data.orders)

        if (!data.orders || !Array.isArray(data.orders)) {
          console.error("Invalid orders data:", data)
          setOrders([])
          setFilteredOrders([])
          setError("Invalid order data received")
          return
        }

        setOrders(data.orders || [])
        setFilteredOrders(data.orders || [])

        // Calculate stats
        const total = data.orders.length
        const revenue = data.orders.reduce((sum: number, order: Order) => sum + (order.sellerSubtotal || 0), 0)
        const pending = data.orders.filter(
          (order: Order) =>
            (order.status || "").toUpperCase() === "PENDING" || (order.status || "").toUpperCase() === "PROCESSING",
        ).length

        setTotalOrders(total)
        setTotalRevenue(revenue)
        setPendingOrders(pending)

        if (data.orders.length === 0) {
          toast.info("No orders found for your products")
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load orders. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filter orders based on search term, status, and current tab
  useEffect(() => {
    let filtered = [...orders]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.products.some((product) => (product.title || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
          ((order.billingDetails?.firstName || "") + " " + (order.billingDetails?.lastName || ""))
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => (order.status || "").toUpperCase() === statusFilter.toUpperCase())
    }

    // Apply tab filter
    if (currentTab !== "all") {
      if (currentTab === "pending") {
        filtered = filtered.filter(
          (order) =>
            (order.status || "").toUpperCase() === "PENDING" || (order.status || "").toUpperCase() === "PROCESSING",
        )
      } else if (currentTab === "shipped") {
        filtered = filtered.filter((order) => (order.status || "").toUpperCase() === "SHIPPED")
      } else if (currentTab === "delivered") {
        filtered = filtered.filter((order) => (order.status || "").toUpperCase() === "DELIVERED")
      } else if (currentTab === "cancelled") {
        filtered = filtered.filter((order) => (order.status || "").toUpperCase() === "CANCELLED")
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
    if (statusUpper === "DELIVERED") return "bg-green-500"
    if (statusUpper === "CANCELLED") return "bg-red-500"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading orders...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="ml-2 text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Package className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{totalOrders}</h3>
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
                <h3 className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</h3>
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
                <h3 className="text-2xl font-bold">{pendingOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab}>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10">
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
                        <TableHead>Products</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">{order._id.substring(0, 8)}...</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{getCustomerName(order.billingDetails)}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {order.products.map((product) => product.title || "Unnamed Product").join(", ")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{order.products.length} item(s)</div>
                          </TableCell>
                          <TableCell>₹{order.sellerSubtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {(order.status || "PENDING").toUpperCase()}
                            </Badge>
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
