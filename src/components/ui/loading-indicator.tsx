"use client"

import { useLoading } from "@/contexts/LoadingContext"
import { Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingIndicator({ size = "md", className }: LoadingIndicatorProps) {
  const { isLoading } = useLoading()
  const { theme } = useTheme()

  if (!isLoading) return null

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
    </div>
  )
}
