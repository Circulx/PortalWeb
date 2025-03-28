"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Sample order data with dates for filtering
const ordersData = [
  {
    id: "00001",
    buyer: "Christine Brooks",
    seller: "ABC Metals",
    date: "2024-01-04",
    displayDate: "04 Jan 2024",
    total: "$12,000",
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "00002",
    buyer: "John Smith",
    seller: "XYZ Corp",
    date: "2024-02-05",
    displayDate: "05 Feb 2024",
    total: "$8,500",
    status: "Pending",
    payment: "Unpaid",
  },
  {
    id: "00003",
    buyer: "Sarah Johnson",
    seller: "Metal Works",
    date: "2024-03-06",
    displayDate: "06 Mar 2024",
    total: "$15,000",
    status: "Shipped",
    payment: "Paid",
  },
  {
    id: "00004",
    buyer: "Michael Brown",
    seller: "Steel Inc",
    date: "2024-04-07",
    displayDate: "07 Apr 2024",
    total: "$9,200",
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "00005",
    buyer: "Emily Davis",
    seller: "Iron Co",
    date: "2024-05-08",
    displayDate: "08 May 2024",
    total: "$11,500",
    status: "Shipped",
    payment: "Paid",
  },
  {
    id: "00006",
    buyer: "David Wilson",
    seller: "Metal Corp",
    date: "2024-06-09",
    displayDate: "09 Jun 2024",
    total: "$7,800",
    status: "Pending",
    payment: "Unpaid",
  },
  {
    id: "00007",
    buyer: "Lisa Anderson",
    seller: "Steel Works",
    date: "2024-07-10",
    displayDate: "10 Jul 2024",
    total: "$13,200",
    status: "Delivered",
    payment: "Paid",
  },
  {
    id: "00008",
    buyer: "Robert Taylor",
    seller: "Iron Industries",
    date: "2024-08-11",
    displayDate: "11 Aug 2024",
    total: "$10,500",
    status: "Shipped",
    payment: "Paid",
  },
]

// Helper function to get month name
const getMonthName = (month: number) => {
  return new Date(2024, month - 1, 1).toLocaleString("default", { month: "short" })
}

// Generate date range options
const generateDateRanges = () => {
  const ranges = []
  for (let i = 1; i <= 12; i++) {
    const startMonth = getMonthName(i)
    const endMonth = getMonthName(i + 1 > 12 ? 1 : i + 1)
    ranges.push(`${startMonth}-${endMonth}`)
  }
  return ranges
}

export default function OrdersTable() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const itemsPerPage = 5

  const dateRanges = useMemo(() => generateDateRanges(), [])

  // Filter orders based on selected filters
  const getFilteredOrders = () => {
    return ordersData.filter((order) => {
      const orderDate = new Date(order.date)
      const orderMonth = orderDate.getMonth() + 1 // JavaScript months are 0-indexed

      const matchesDate =
        dateFilter === "all" ||
        (() => {
          if (dateFilter !== "all") {
            const [startMonth, endMonth] = dateFilter.split("-")
            const startMonthIndex = dateRanges.findIndex((range) => range.startsWith(startMonth))
            const endMonthIndex = (startMonthIndex + 1) % 12

            if (startMonthIndex < endMonthIndex) {
              return orderMonth > startMonthIndex && orderMonth <= endMonthIndex
            } else {
              return orderMonth > startMonthIndex || orderMonth <= endMonthIndex
            }
          }
          return false
        })()

      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesDate && matchesStatus
    })
  }

  const filteredOrders = getFilteredOrders()
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }

  const handleRowClick = (orderId: string) => {
    router.push(`/admin/order/${orderId}`)
  }

  const handleReset = () => {
    setDateFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  // Get unique statuses for filter options
  const statuses = [...new Set(ordersData.map((order) => order.status))]

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg font-semibold">List of Orders</h2>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-end">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {dateRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Reset Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>BUYER NAME</TableHead>
                <TableHead>SELLER NAME</TableHead>
                <TableHead>ORDER DATE</TableHead>
                <TableHead>TOTAL ORDER</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>PAYMENT STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentPageData().map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(order.id)}
                >
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.buyer}</TableCell>
                  <TableCell>{order.seller}</TableCell>
                  <TableCell>{order.displayDate}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.payment === "Paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.payment}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

