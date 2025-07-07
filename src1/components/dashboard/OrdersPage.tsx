"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Package, Star, Calendar, CreditCard, Truck } from "lucide-react"
import { toast } from "sonner"
import ReviewModal from "./ReviewModal"

interface Order {
  _id: string
  userId: string
  products: Array<{
    productId: string
    seller_id: string
    title: string
    quantity: number
    price: number
    image_link?: string
  }>
  billingDetails: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  totalAmount: number
  subTotal: number
  discount: number
  tax: number
  paymentMethod: "COD" | "ONLINE"
  paymentDetails?: {
    paymentId?: string
    orderId?: string
    signature?: string
  }
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  additionalNotes?: string
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    order: Order | null
    product: any | null
  }>({
    isOpen: false,
    order: null,
    product: null,
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/orders")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch orders")
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Calendar className="w-4 h-4" />
      case "PROCESSING":
        return <Package className="w-4 h-4" />
      case "SHIPPED":
        return <Truck className="w-4 h-4" />
      case "DELIVERED":
        return <Package className="w-4 h-4" />
      case "CANCELLED":
        return <Package className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filterOrders = (status: string) => {
    if (status === "all") return orders
    return orders.filter((order) => order.status === status.toUpperCase())
  }

  const openReviewModal = (order: Order, product: any) => {
    setReviewModal({
      isOpen: true,
      order,
      product,
    })
  }

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      order: null,
      product: null,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchOrders}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterOrders("pending").length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({filterOrders("processing").length})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({filterOrders("shipped").length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({filterOrders("delivered").length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({filterOrders("cancelled").length})</TabsTrigger>
        </TabsList>

        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterOrders(tab).length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-500">
                    {tab === "all" ? "You haven't placed any orders yet." : `No ${tab} orders found.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterOrders(tab).map((order) => (
                <Card key={order._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">Order #{order._id.slice(-8)}</CardTitle>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Products */}
                      <div className="space-y-3">
                        {order.products.map((product, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <img
                              src={product.image_link || "/placeholder.svg?height=60&width=60"}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{product.title}</h4>
                              <p className="text-sm text-gray-500">
                                Quantity: {product.quantity} × ₹{product.price.toFixed(2)}
                              </p>
                            </div>
                            {order.status === "DELIVERED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openReviewModal(order, product)}
                                className="flex items-center space-x-1"
                              >
                                <Star className="w-4 h-4" />
                                <span>Review</span>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Order Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Billing Details</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              {order.billingDetails.firstName} {order.billingDetails.lastName}
                            </p>
                            <p>{order.billingDetails.email}</p>
                            <p>{order.billingDetails.phone}</p>
                            <p>
                              {order.billingDetails.address}, {order.billingDetails.city}
                            </p>
                            <p>
                              {order.billingDetails.state} {order.billingDetails.zipCode}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Order Summary</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>₹{order.subTotal.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>-₹{order.discount.toFixed(2)}</span>
                              </div>
                            )}
                            {order.tax > 0 && (
                              <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>₹{order.tax.toFixed(2)}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Total:</span>
                              <span>₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <CreditCard className="w-4 h-4" />
                              <span className="text-sm">
                                {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.additionalNotes && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Additional Notes</h4>
                            <p className="text-sm text-gray-600">{order.additionalNotes}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={closeReviewModal}
        order={reviewModal.order}
        product={reviewModal.product}
      />
    </div>
  )
}
