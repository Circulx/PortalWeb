"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, DollarSign, Clock, Package, CheckCircle, XCircle } from "lucide-react"
import type { OrderDocument } from "@/types/order"

interface OrderStatsProps {
  orders: OrderDocument[]
  loading: boolean
}

export function OrderStats({ orders, loading }: OrderStatsProps) {
  // Calculate stats
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

  const countByStatus = (status: string) => {
    return orders.filter((order) => order.status?.toUpperCase() === status.toUpperCase()).length
  }

  const pendingOrders = countByStatus("PENDING")
  const processingOrders = countByStatus("PROCESSING")
  const shippedOrders = countByStatus("SHIPPED")
  const deliveredOrders = countByStatus("DELIVERED")
  const cancelledOrders = countByStatus("CANCELLED")

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">All orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">All time revenue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">Awaiting processing</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingOrders}</div>
          <p className="text-xs text-muted-foreground">Being prepared</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deliveredOrders}</div>
          <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cancelledOrders}</div>
          <p className="text-xs text-muted-foreground">Orders cancelled</p>
        </CardContent>
      </Card>
    </div>
  )
}
