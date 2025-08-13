"use client"

import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Flag, Clock, ChevronDown, Filter, Calculator } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Product {
  _id?: string
  product_id: number
  title: string
  image_link?: string
  seller_name: string
  status?: string
  commission?: string
  price?: number
  commission_type?: "percentage" | "fixed"
  commission_value?: number
  final_price?: number
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
  const [updatingCommission, setUpdatingCommission] = useState<number | null>(null)
  const [updatingCommissionDetails, setUpdatingCommissionDetails] = useState<number | null>(null)
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

      // Ensure all products have required fields
      const productsWithStatus = (data.products || []).map((product: Product) => ({
        ...product,
        status: product.status || "Pending",
        commission: product.commission || "No",
        price: product.price || 0,
        commission_type: product.commission_type || "percentage",
        commission_value: product.commission_value || 0,
        final_price: product.final_price || product.price || 0,
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

  const calculateFinalPrice = (originalPrice: number, commissionType: string, commissionValue: number) => {
    if (commissionType === "percentage") {
      return originalPrice + (originalPrice * commissionValue) / 100
    } else {
      return originalPrice + commissionValue
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

      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_id === productId ? { ...product, status: newStatus } : product)),
      )

      setFilteredProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_id === productId ? { ...product, status: newStatus } : product)),
      )

      toast({
        title: "Status Updated",
        description: `Product ID ${productId} status changed to ${newStatus}`,
      })
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

  const handleCommissionChange = async (productId: number, newCommission: string) => {
    try {
      setUpdatingCommission(productId)

      const response = await fetch("/api/admin/products/update-commission", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          commission: newCommission,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update commission")
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.product_id === productId) {
            const updatedProduct = { ...product, commission: newCommission }
            // Reset commission details if commission is set to "No"
            if (newCommission === "No") {
              updatedProduct.commission_type = "percentage"
              updatedProduct.commission_value = 0
              updatedProduct.final_price = product.price || 0
            }
            return updatedProduct
          }
          return product
        }),
      )

      setFilteredProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.product_id === productId) {
            const updatedProduct = { ...product, commission: newCommission }
            if (newCommission === "No") {
              updatedProduct.commission_type = "percentage"
              updatedProduct.commission_value = 0
              updatedProduct.final_price = product.price || 0
            }
            return updatedProduct
          }
          return product
        }),
      )

      toast({
        title: "Commission Updated",
        description: `Product ID ${productId} commission changed to ${newCommission}`,
      })
    } catch (error) {
      console.error("Error updating commission:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update Product ID ${productId} commission`,
        
      })
    } finally {
      setUpdatingCommission(null)
    }
  }

  const handleCommissionDetailsChange = async (productId: number, commissionType: string, commissionValue: number) => {
    try {
      setUpdatingCommissionDetails(productId)

      const product = products.find((p) => p.product_id === productId)
      if (!product) return

      const finalPrice = calculateFinalPrice(product.price || 0, commissionType, commissionValue)

      const response = await fetch("/api/admin/products/update-commission-details", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          commission_type: commissionType,
          commission_value: commissionValue,
          final_price: finalPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update commission details")
      }

      const updateProduct = (product: Product) => {
        if (product.product_id === productId) {
          return {
            ...product,
            commission_type: commissionType as "percentage" | "fixed",
            commission_value: commissionValue,
            final_price: finalPrice,
          }
        }
        return product
      }

      setProducts((prevProducts) => prevProducts.map(updateProduct))
      setFilteredProducts((prevProducts) => prevProducts.map(updateProduct))

      toast({
        title: "Commission Details Updated",
        description: `Product ID ${productId} commission details updated successfully`,
      })
    } catch (error) {
      console.error("Error updating commission details:", error)
      toast({
        title: "Update Failed",
        description: `Failed to update Product ID ${productId} commission details`,
        
      })
    } finally {
      setUpdatingCommissionDetails(null)
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

  const CommissionDetailsCell = ({ product }: { product: Product }) => {
    const [localCommissionType, setLocalCommissionType] = useState(product.commission_type || "percentage")
    const [localCommissionValue, setLocalCommissionValue] = useState(product.commission_value || 0)
    const [isEditing, setIsEditing] = useState(false)

    const isCommissionActive = product.commission === "Yes"
    const isUpdating = updatingCommissionDetails === product.product_id

    const handleSave = () => {
      handleCommissionDetailsChange(product.product_id, localCommissionType, localCommissionValue)
      setIsEditing(false)
    }

    const handleCancel = () => {
      setLocalCommissionType(product.commission_type || "percentage")
      setLocalCommissionValue(product.commission_value || 0)
      setIsEditing(false)
    }

    if (!isCommissionActive) {
      return (
        <div className="text-center text-gray-400 text-sm">
          <span>Commission Disabled</span>
        </div>
      )
    }

    return (
      <div className="space-y-2 min-w-[200px]">
        {isEditing ? (
          <div className="space-y-2">
            <Select value={localCommissionType} >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={localCommissionValue}
              onChange={(e) => setLocalCommissionValue(Number(e.target.value))}
              placeholder={localCommissionType === "percentage" ? "Enter %" : "Enter ₹"}
              className="w-full"
              min="0"
              step={localCommissionType === "percentage" ? "0.1" : "1"}
            />

            <div className="flex gap-1">
              <Button size="sm" onClick={handleSave} disabled={isUpdating} className="flex-1">
                {isUpdating ? <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" /> : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {product.commission_type === "percentage" ? "Percentage" : "Fixed Amount"}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-6 px-2">
                Edit
              </Button>
            </div>

            <div className="text-sm font-medium">
              {product.commission_type === "percentage"
                ? `${product.commission_value}%`
                : `₹${product.commission_value}`}
            </div>

            <div className="text-xs text-gray-600">Original: ₹{product.price?.toLocaleString()}</div>

            <div className="text-sm font-bold text-green-600 flex items-center gap-1">
              <Calculator className="h-3 w-3" />
              Final: ₹{product.final_price?.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    )
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
                <Button variant="outline" className="ml-2 bg-transparent">
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
                  <th className="h-12 px-4 text-left align-middle font-medium">ADD Commission</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Commission Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">
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
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`${
                                product.commission === "Yes" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                              } flex items-center gap-1 px-2 py-1 text-xs font-medium`}
                              disabled={updatingCommission === product.product_id}
                            >
                              {updatingCommission === product.product_id ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                              ) : null}
                              {product.commission || "No"}
                              <ChevronDown className="ml-1 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-blue-600"
                              onClick={() => handleCommissionChange(product.product_id, "Yes")}
                            >
                              Yes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-gray-600"
                              onClick={() => handleCommissionChange(product.product_id, "No")}
                            >
                              No
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="p-4 align-middle">
                        <CommissionDetailsCell product={product} />
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
