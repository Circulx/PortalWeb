"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Star, Package, Truck, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  id: string
  date: string
  total: number
  shipTo: string
  status: string
  paymentMethod?: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [timeFilter, setTimeFilter] = useState("all")
  const [hiddenRatingBanners, setHiddenRatingBanners] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()

        // Map the API response to the Order interface
        const mappedOrders: Order[] = data.map((order: any) => ({
          id: order._id || order.orderId || "N/A",
          date: order.createdAt || new Date().toISOString(),
          total: order.totalAmount || order.subTotal || 0,
          shipTo: order.billingDetails?.firstName
            ? `${order.billingDetails.firstName} ${order.billingDetails.lastName || ""}`
            : "N/A",
          status: order.status || "PENDING",
          items:
            order.products?.map((product: any) => ({
              id: product.productId || "N/A",
              name: product.title || "Product",
              image: product.image_link || "/placeholder.svg",
              price: product.price || 0,
              quantity: product.quantity || 1,
            })) || [],
          paymentMethod: order.paymentMethod || "Online",
        }))

        setOrders(mappedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    // If filter is "all", return all orders sorted by date
    if (timeFilter === "all") {
      return orders
        .filter((order) => {
          const orderDate = parseISO(order.date)
          return !isNaN(orderDate.getTime()) // Only filter out invalid dates
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    const now = new Date()
    const year = timeFilter === "2024" ? 2024 : timeFilter === "2023" ? 2023 : null

    return orders
      .filter((order) => {
        const orderDate = parseISO(order.date)
        if (isNaN(orderDate.getTime())) return false

        if (year) {
          return orderDate.getFullYear() === year
        }

        // For past3Months and past6Months
        const months = timeFilter === "past3Months" ? 3 : 6
        const filterDate = new Date()
        filterDate.setMonth(filterDate.getMonth() - months)

        return orderDate >= filterDate && orderDate <= now
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [timeFilter, orders])

  const hideRatingBanner = (orderId: string) => {
    setHiddenRatingBanners((prev) => [...prev, orderId])
  }

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower.includes("delivered")) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Delivered
        </Badge>
      )
    } else if (statusLower.includes("shipped")) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Shipped
        </Badge>
      )
    } else if (statusLower.includes("processing") || statusLower.includes("pending")) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {statusLower.includes("processing") ? "Processing" : "Pending"}
        </Badge>
      )
    } else if (statusLower.includes("cancelled")) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Cancelled
        </Badge>
      )
    }

    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Orders</h1>
          <p className="text-gray-600">Track, manage, and review your orders</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center">
              <TabsList className="bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="orders"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  All Orders
                </TabsTrigger>
                <TabsTrigger
                  value="notShipped"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Not Shipped
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Cancelled
                </TabsTrigger>
              </TabsList>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px] bg-white border">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="past3Months">Past 3 Months</SelectItem>
                  <SelectItem value="past6Months">Past 6 Months</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-900"></div>
              </div>
            ) : (
              <>
                <TabsContent value="orders" className="mt-6">
                  {filteredOrders.length > 0 ? (
                    <div className="space-y-6">
                      {filteredOrders.map((order) => {
                        const isExpanded = expandedOrders.includes(order.id)
                        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

                        return (
                          <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50 p-4 md:p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium">Order #{order.id}</h3>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Placed on {format(parseISO(order.date), "MMMM d, yyyy")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="font-medium">₹{order.total.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">
                                      {totalItems} {totalItems === 1 ? "item" : "items"}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-2"
                                    onClick={() => toggleOrderExpand(order.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>

                            {isExpanded && (
                              <CardContent className="p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <Package className="h-4 w-4" />
                                      Order Details
                                    </h4>
                                    <div className="space-y-4">
                                      {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                          <div className="flex-shrink-0">
                                            <Image
                                              src={item.image || "/placeholder.svg"}
                                              alt={item.name}
                                              width={80}
                                              height={80}
                                              className="object-cover rounded-md"
                                            />
                                          </div>
                                          <div className="flex-grow">
                                            <h5 className="font-medium text-sm">{item.name}</h5>
                                            <div className="flex justify-between mt-1">
                                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                              <p className="text-sm font-medium">₹{item.price.toFixed(2)}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="font-medium mb-2">Shipping Information</h4>
                                      <p className="text-sm">{order.shipTo}</p>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">Payment Method</h4>
                                      <p className="text-sm">{order.paymentMethod}</p>
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">Order Summary</h4>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span>Subtotal:</span>
                                          <span>₹{order.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Shipping:</span>
                                          <span>₹0.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Tax:</span>
                                          <span>Included</span>
                                        </div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-medium">
                                          <span>Total:</span>
                                          <span>₹{order.total.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-4">
                                      <Button className="bg-emerald-900 hover:bg-emerald-800">Track Order</Button>
                                      <Button variant="outline">View Invoice</Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Rating Banner */}
                                {!hiddenRatingBanners.includes(order.id) && (
                                  <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                        <span className="text-sm md:text-base">
                                          How was your experience? Rate this order
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => hideRatingBanner(order.id)}
                                      >
                                        ×
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-lg border">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders found</h3>
                      <p className="text-gray-500 mb-6">You haven't placed any orders yet or none match your filter.</p>
                      <Button className="bg-emerald-900 hover:bg-emerald-800">Start Shopping</Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notShipped">
                  <div className="text-center py-16 bg-white rounded-lg border mt-6">
                    <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders in transit</h3>
                    <p className="text-gray-500">
                      All your orders have been delivered or none are currently being shipped.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="cancelled">
                  <div className="text-center py-16 bg-white rounded-lg border mt-6">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cancelled orders</h3>
                    <p className="text-gray-500">You don't have any cancelled orders.</p>
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
