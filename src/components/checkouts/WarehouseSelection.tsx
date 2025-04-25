"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"

interface WarehouseOption {
  id: string
  name: string
  logo: string
  provider: string
  charge: number
}

interface WarehouseSelectionProps {
  onWarehouseSelect: (warehouseId: string | null) => void
  disabled?: boolean
}

const warehouseOptions: WarehouseOption[] = [
  {
    id: "aaj1",
    name: "AAJ Supply Chain",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "AAJ Supply Chain",
    charge: 8000,
  },
  {
    id: "mahindra1",
    name: "Mahindra Logistics",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Mahindra Logistics",
    charge: 8000,
  },
  {
    id: "shiprocket1",
    name: "Shiprocket",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Shiprocket",
    charge: 8000,
  },
  {
    id: "holisol1",
    name: "Holisol Logistics",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Holisol Logistics",
    charge: 8000,
  },
  {
    id: "pingo1",
    name: "Pingo",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Pingo",
    charge: 8000,
  },
  {
    id: "tvs1",
    name: "TVS Supply Chain",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "TVS Supply Chain",
    charge: 8000,
  },
  {
    id: "warehousing1",
    name: "Warehousing Express",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Warehousing Express",
    charge: 8000,
  },
  {
    id: "warehouse-now1",
    name: "Warehouse Now",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Warehouse Now",
    charge: 8000,
  },
  {
    id: "etrezi1",
    name: "Etrezi",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Etrezi",
    charge: 8000,
  },
]

const WarehouseSelection: React.FC<WarehouseSelectionProps> = ({ onWarehouseSelect, disabled = false }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)

  const handleWarehouseSelect = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId)
    onWarehouseSelect(warehouseId)
  }

  return (
    <div
      className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose a Warehouse</h2>
        <div className="border-b-2 border-blue-500 w-64 mx-auto mb-4"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouseOptions.map((warehouse) => (
          <div
            key={warehouse.id}
            className={`border rounded-lg p-4 flex flex-col items-center transition-all ${
              selectedWarehouse === warehouse.id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
              <Image src={warehouse.logo || "/placeholder.svg"} alt={warehouse.name} width={60} height={60} />
            </div>
            <h3 className="text-sm font-medium mb-1">{warehouse.provider}</h3>
            <p className="text-orange-600 font-medium text-sm mb-2">₹{warehouse.charge.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mb-3">For 500 products</p>
            <button
              onClick={() => handleWarehouseSelect(warehouse.id)}
              className={`px-4 py-1 rounded text-sm font-medium ${
                selectedWarehouse === warehouse.id
                  ? "bg-orange-500 text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {selectedWarehouse === warehouse.id ? "Selected" : "Select"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WarehouseSelection
