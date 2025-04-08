"use client"

import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, Flag, Clock, ChevronDown, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id?: string
  product_id: number
  title: string
  image_link?: string
  seller_name: string
  status?: string
  created_at?: string
}

export function ReviewsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const { toast } = useToast()

  const productsPerPage = 10
  const placeholderImage = "/placeholder.svg"

  useEffect(() => {
    fetchProducts()
  }, [currentPage, statusFilter, dateFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      queryParams.append("page", currentPage.toString())
      queryParams.append("limit", productsPerPage.toString())

      if (statusFilter) {
        queryParams.append("status", statusFilter)
      }

      if (dateFilter) {
        queryParams.append("date", dateFilter)
      }

      const response = await fetch(`/api/admin/products?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()

      // Ensure all products have a status field (default to "Pending")
      const productsWithStatus = (data.products || []).map((product: Product) => ({
        ...product,
        status: product.status || "Pending",
      }))

      setProducts(productsWithStatus)
      setFilteredProducts(productsWithStatus)
      setTotalPages(Math.ceil((data.total || 0) / productsPerPage))
      setLoading(false)
    } catch (err) {
      setError("Error fetching products. Please try again.")
      setLoading(false)
      console.error("Error fetching products:", err)
    }
  }

  const handleStatusChange = async (productId: number, newStatus: string) => {
    try {
      setUpdatingStatus(productId)

      const response = await fetch("/api/admin/products/update-status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status")
      }

      // Update the product in the local state
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_id === productId ? { ...product, status: newStatus } : product)),
      )

      setFilteredProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_id === productId ? { ...product, status: newStatus } : product)),
      )

      // Show success toast with product ID
      toast({
        title: "Status Updated",
        description: `Product ID ${productId} status changed to ${newStatus}`,
      })

      console.log(`Product ID ${productId} status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update Product ID ${productId} status`,
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const resetFilters = () => {
    setStatusFilter(null)
    setDateFilter(null)
    setCurrentPage(1)
  }

  const getStatusColor = (status: string | undefined) => {
    const statusColors: Record<string, string> = {
      Pending: "bg-orange-100 text-orange-800",
      Approved: "bg-green-100 text-green-800",
      Flagged: "bg-red-100 text-red-800",
    }

    return status && statusColors[status] ? statusColors[status] : statusColors["Pending"]
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "Approved":
        return <Check className="h-4 w-4" />
      case "Flagged":
        return <Flag className="h-4 w-4" />
      case "Pending":
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-4">
          <h2 className="text-xl font-semibold">Product Table</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter By</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-2">
                  {statusFilter || "All Status"} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter(null)
                    setCurrentPage(1)
                  }}
                >
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("Pending")
                    setCurrentPage(1)
                  }}
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("Approved")
                    setCurrentPage(1)
                  }}
                >
                  Approved
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStatusFilter("Flagged")
                    setCurrentPage(1)
                  }}
                >
                  Flagged
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              onClick={resetFilters}
              className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Reset Filter
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Image</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Product ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Product Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Seller Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id || product.product_id} className="border-b">
                      <td className="p-4 align-middle">
                        <div className="h-12 w-12 overflow-hidden rounded-md relative">
                          <img
                            src={product.image_link || placeholderImage}
                            alt={product.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = placeholderImage
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-4 align-middle">{product.product_id}</td>
                      <td className="p-4 align-middle">{product.title}</td>
                      <td className="p-4 align-middle">{product.seller_name}</td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`${getStatusColor(product.status)} flex items-center gap-1 px-2 py-1 text-xs font-medium`}
                              disabled={updatingStatus === product.product_id}
                            >
                              {updatingStatus === product.product_id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                              ) : (
                                getStatusIcon(product.status)
                              )}
                              {product.status || "Pending"}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-green-600"
                              onClick={() => handleStatusChange(product.product_id, "Approved")}
                            >
                              <Check className="h-4 w-4" />
                              Approved
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-orange-600"
                              onClick={() => handleStatusChange(product.product_id, "Pending")}
                            >
                              <Clock className="h-4 w-4" />
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-red-600"
                              onClick={() => handleStatusChange(product.product_id, "Flagged")}
                            >
                              <Flag className="h-4 w-4" />
                              Flagged
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 0 && (
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
