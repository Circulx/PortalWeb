"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface OrderStatusUpdaterProps {
  currentStatus: string
  orderId: string
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>
}

// Define valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [], // Final state
  cancelled: [], // Final state
  completed: [], // Final state (alias for delivered)
}

// Status display names
const STATUS_DISPLAY: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  completed: "Completed",
}

export function OrderStatusUpdater({ currentStatus, orderId, onStatusUpdate }: OrderStatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [localStatus, setLocalStatus] = useState(currentStatus)

  // Get available status options based on current status
  const getAvailableStatuses = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    const transitions = STATUS_TRANSITIONS[normalizedStatus] || []

    // Always include current status
    return [normalizedStatus, ...transitions]
  }

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === localStatus.toLowerCase()) {
      return // No change
    }

    setIsUpdating(true)
    try {
      await onStatusUpdate(orderId, newStatus)
      setLocalStatus(newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
      // Status will be reverted by parent component
    } finally {
      setIsUpdating(false)
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase()
    if (statusUpper === "PENDING") return "bg-yellow-500 text-white"
    if (statusUpper === "PROCESSING") return "bg-blue-500 text-white"
    if (statusUpper === "SHIPPED") return "bg-purple-500 text-white"
    if (statusUpper === "DELIVERED" || statusUpper === "COMPLETED") return "bg-green-500 text-white"
    if (statusUpper === "CANCELLED") return "bg-red-500 text-white"
    return "bg-gray-500 text-white"
  }

  const availableStatuses = getAvailableStatuses(localStatus)
  const isStatusFinal = availableStatuses.length <= 1

  // If status is final (delivered/cancelled), just show badge
  if (isStatusFinal) {
    return (
      <Badge className={getStatusColor(localStatus)}>
        {STATUS_DISPLAY[localStatus.toLowerCase()] || localStatus.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}

      <Select value={localStatus.toLowerCase()} onValueChange={handleStatusChange} disabled={isUpdating}>
        <SelectTrigger className="w-[130px] h-8">
          <SelectValue>
            <Badge className={getStatusColor(localStatus)} variant="secondary">
              {STATUS_DISPLAY[localStatus.toLowerCase()] || localStatus.toUpperCase()}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(status)} variant="secondary">
                  {STATUS_DISPLAY[status] || status.toUpperCase()}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
