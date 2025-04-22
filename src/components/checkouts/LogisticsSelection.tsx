"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

interface LogisticsOption {
  id: string
  name: string
  logo: string
  provider: string
}

interface LogisticsSelectionProps {
  onLogisticsSelect: (logisticsId: string | null) => void
  disabled?: boolean
}

const logisticsOptions: LogisticsOption[] = [
  {
    id: "bluedart1",
    name: "Blue Dart",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Blue Dart",
  },
  {
    id: "delhivery1",
    name: "Delhivery",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Delhivery",
  },
  {
    id: "fedex1",
    name: "FedEx",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "FedEx",
  },
  {
    id: "ekart1",
    name: "Ekart",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Ekart",
  },
  {
    id: "ecomexpress1",
    name: "Ecom Express",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Ecom Express",
  },
  {
    id: "dhl1",
    name: "DHL",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "DHL",
  },
  {
    id: "shadowfax1",
    name: "Shadowfax",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Shadowfax",
  },
  {
    id: "gati1",
    name: "GATI",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "GATI",
  },
  {
    id: "safeexpress1",
    name: "Safeexpress",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Safeexpress",
  },
  {
    id: "fmlogistic1",
    name: "FM Logistic",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "FM Logistic",
  },
  {
    id: "dtdc1",
    name: "DTDC",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "DTDC",
  },
  {
    id: "xpressbees1",
    name: "Xpressbees",
    logo: "/placeholder.svg?height=60&width=60",
    provider: "Xpressbees",
  },
]

const LogisticsSelection: React.FC<LogisticsSelectionProps> = ({ onLogisticsSelect, disabled = false }) => {
  const [selectedLogistics, setSelectedLogistics] = useState<string | null>(null)

  const handleLogisticsSelect = (logisticsId: string) => {
    setSelectedLogistics(logisticsId)
  }

  return (
    <div
      className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Choose a Logistic Partner</h2>
        <div className="border-b-2 border-blue-500 w-64 mx-auto mb-4"></div>
      </div>

      {/* Demo Banner */}
      <div className="bg-yellow-400 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Get a Free Demo</h3>
        </div>
        <div className="flex-shrink-0">
          <Image
            src="/placeholder.svg?height=80&width=120"
            alt="Logistics truck"
            width={120}
            height={80}
            className="rounded-lg"
          />
        </div>
        <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Request Demo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {logisticsOptions.map((logistics) => (
          <div
            key={logistics.id}
            className={`border-2 rounded-lg p-4 flex flex-col items-center transition-all ${
              selectedLogistics === logistics.id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="w-16 h-16 mb-3 flex items-center justify-center">
              <Image src={logistics.logo || "/placeholder.svg"} alt={logistics.name} width={60} height={60} />
            </div>
            <h3 className="text-sm font-medium mb-2">{logistics.provider}</h3>
            <button
              onClick={() => handleLogisticsSelect(logistics.id)}
              className={`px-4 py-1 rounded text-sm font-medium ${
                selectedLogistics === logistics.id
                  ? "bg-orange-500 text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {selectedLogistics === logistics.id ? "Selected" : "Select"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onLogisticsSelect(selectedLogistics)}
          disabled={!selectedLogistics}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}

export default LogisticsSelection
