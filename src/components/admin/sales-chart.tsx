"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area } from "recharts"

// Define the structure for our data points
interface SalesDataPoint {
  value: number
  percentage: number
  k: string
}

// Define monthly data structure
interface MonthlyData {
  [key: string]: SalesDataPoint[]
}

// Generate sample data for each month
const generateMonthlyData = (): MonthlyData => {
  const months = ["october", "november", "december"]
  const monthlyData: MonthlyData = {}

  months.forEach((month) => {
    monthlyData[month] = Array.from({ length: 12 }, (_, i) => {
      const k = `${(i + 1) * 5}k`
      // Generate different patterns for different months
      const basePercentage = month === "october" ? 40 : month === "november" ? 50 : 45
      return {
        k,
        value: (i + 1) * 5000,
        percentage: Math.floor(Math.random() * 40) + basePercentage,
      }
    })
  })

  return monthlyData
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-lg p-2 text-xs">
        <p className="font-medium text-orange-500">{payload[0].value.toFixed(4)}%</p>
      </div>
    )
  }
  return null
}

export function SalesChart() {
  const [selectedMonth, setSelectedMonth] = useState("october")
  const monthlyData = generateMonthlyData()

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Sales Details</h3>
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="october">October</SelectItem>
            <SelectItem value="november">November</SelectItem>
            <SelectItem value="december">December</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData[selectedMonth]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="k"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B2C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="transparent"
                fill="url(#colorGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#FF6B2C"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#FF6B2C",
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
                activeDot={{
                  r: 6,
                  fill: "#FF6B2C",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
