import { Card, CardContent } from "@/components/ui/card"
import type { PendingCardProps } from "@/types/dashboard"
import { ArrowUp } from "lucide-react"

export function PendingCard({ title, value, change, icon }: PendingCardProps) {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-6">
        {/* Card content container */}
        <div className="flex items-center justify-between">
          {/* Left side - Pending information */}
          <div>
            {/* Card title */}
            <p className="text-sm text-gray-600">{title}</p>
            {/* Main value display */}
            <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
            {/* Change indicator section */}
            <div className="flex items-center mt-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">{change.value}</span>
              <span className="text-sm text-gray-600 ml-1">{change.period}</span>
            </div>
          </div>
          {/* Right side - Icon container with destructive color */}
          <div className="p-3 bg-red-100 rounded-full text-red-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
