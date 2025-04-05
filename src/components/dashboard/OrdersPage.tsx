"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Star, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, subMonths, isWithinInterval, parseISO, startOfYear } from "date-fns"

interface OrderItem {
  id: string
  name: string
  image: string
  returnEligible: boolean
  returnDate: string
  price: number
}

interface Order {
  id: string
  date: string
  total: number
  shipTo: string
  status: string
  items: OrderItem[]
}

// Mock data with more orders and different dates
// const mockOrders: Order[] = [
//   {
//     id: "112-0822160-5390023",
//     date: "2024-01-15",
//     total: 157.99,
//     shipTo: "Irakli Lolashvili",
//     status: "Delivered",
//     items: [
//       {
//         id: "1",
//         name: "SAMSUNG 980 PRO SSD 2TB PCIe NVMe Gen 4 Gaming M.2 Internal Solid State Drive Memory Card",
//         image: "/login.png",
//         returnEligible: true,
//         returnDate: "2024-02-15",
//         price: 157.99,
//       },
//     ],
//   },
//   {
//     id: "112-0822160-5390024",
//     date: "2023-11-20",
//     total: 299.99,
//     shipTo: "Irakli Lolashvili",
//     status: "Delivered",
//     items: [
//       {
//         id: "2",
//         name: "Gaming Monitor 27-inch 4K",
//         image: "/login.png",
//         returnEligible: false,
//         returnDate: "2023-12-20",
//         price: 299.99,
//       },
//     ],
//   },
//   {
//     id: "112-0822160-5390025",
//     date: "2023-06-10",
//     total: 79.99,
//     shipTo: "Irakli Lolashvili",
//     status: "Delivered",
//     items: [
//       {
//         id: "3",
//         name: "Wireless Gaming Mouse",
//         image: "/placeholder.svg",
//         returnEligible: false,
//         returnDate: "2023-07-10",
//         price: 79.99,
//       },
//     ],
//   },
// ]

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [timeFilter, setTimeFilter] = useState("past3Months")
  const [hiddenRatingBanners, setHiddenRatingBanners] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        console.log(data[0]);

        const mappedOrders: Order[] = data.map((order: any) => ({
          id: order._id.$oid || order.order_id, // Use _id.$oid or order_id as id
          date: order.order_date,
          total: order.amount,
          shipTo: order.billingDetails.name, // Use billingDetails.name as shipTo
          status: order.status,
          items: [
            {
              id: order.order_id, // Use order_id as item id
              name: "Order Item", // Placeholder name (update if item details are available)
              image: "/placeholder.svg", // Placeholder image (update if item images are available)
              returnEligible: false, // Placeholder return eligibility
              returnDate: "", // Placeholder return date
              price: order.amount, // Use order amount as item price
            },
          ],
        }));
        console.log("mapped: ", mappedOrders);
        setOrders(mappedOrders); // Set fetched orders
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const now = new Date()
    let filterDate: Date

    switch (timeFilter) {
      case "past3Months":
        filterDate = subMonths(now, 3)
        break
      case "past6Months":
        filterDate = subMonths(now, 6)
        break
      case "2024":
        filterDate = startOfYear(new Date(2024, 0, 1))
        break
      case "2023":
        filterDate = startOfYear(new Date(2023, 0, 1))
        break
      default:
        filterDate = subMonths(now, 3)
    }

    return orders
      .filter((order) => {
        const orderDate = parseISO(order.date);

        if (isNaN(orderDate.getTime())) {
          console.log("Invalid order date:", order.date);
          return false;
        }
        if (timeFilter === "2024" || timeFilter === "2023") {
          const year = timeFilter === "2024" ? 2024 : 2023
          return orderDate.getFullYear() === year
        }
        return isWithinInterval(orderDate, {
          start: filterDate,
          end: now,
        })
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [timeFilter])

  const hideRatingBanner = (orderId: string) => {
    setHiddenRatingBanners((prev) => [...prev, orderId])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Card className="max-w-7xl mx-auto">
        <div className="p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold">Your Orders</h1>
              <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">{filteredOrders.length}</span>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[140px] md:w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="past3Months">Past 3 Months</SelectItem>
                  <SelectItem value="past6Months">Past 6 Months</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
              <TabsTrigger
                value="orders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-900 data-[state=active]:bg-transparent whitespace-nowrap"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="notShipped"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-900 data-[state=active]:bg-transparent whitespace-nowrap"
              >
                Not Yet Shipped
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-900 data-[state=active]:bg-transparent whitespace-nowrap"
              >
                Cancelled Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6 space-y-6">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    {/* Order Header */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50">
                      <div>
                        <p className="text-sm text-gray-600">Order placed</p>
                        <p className="font-medium">{format(parseISO(order.date), "MMMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ship to</p>
                        <p className="font-medium">{order.shipTo}</p>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-600">Order # {order.id}</p>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <Button variant="link" className="h-auto p-0 text-emerald-900">
                              View order details
                            </Button>
                            <Button variant="link" className="h-auto p-0 text-emerald-900">
                              View invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Banner */}
                    {!hiddenRatingBanners.includes(order.id) && (
                      <div className="p-4 bg-yellow-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <span className="text-sm md:text-base">Please rate your experience with the seller</span>
                          </div>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => hideRatingBanner(order.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="p-4">
                      <p className="font-medium text-emerald-900 mb-4">
                        {order.status} {format(parseISO(order.date), "MMMM d")}
                      </p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-6">
                          <div className="flex-shrink-0 w-full md:w-auto">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="object-cover w-full md:w-[100px] h-[100px]"
                            />
                          </div>
                          <div className="flex-grow space-y-4">
                            <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
                            {item.returnEligible && (
                              <p className="text-xs md:text-sm text-gray-600">
                                Return or replace items: Eligible through{" "}
                                {format(parseISO(item.returnDate), "MMMM d, yyyy")}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button className="bg-emerald-900 hover:bg-orange-500 text-sm h-8 md:h-10">
                                Buy it again
                              </Button>
                              <Button variant="outline" className="text-sm h-8 md:h-10">
                                View your item
                              </Button>
                              <Button variant="outline" className="text-sm h-8 md:h-10">
                                Track package
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Write a product review</DropdownMenuItem>
                                  <DropdownMenuItem>Archive order</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">No orders found for the selected time period</div>
              )}
            </TabsContent>

            <TabsContent value="notShipped">
              <div className="text-center py-8 text-gray-600">No orders waiting to be shipped</div>
            </TabsContent>

            <TabsContent value="cancelled">
              <div className="text-center py-8 text-gray-600">No cancelled orders</div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}

