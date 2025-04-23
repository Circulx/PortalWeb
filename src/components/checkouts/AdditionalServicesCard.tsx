"use client"

import type React from "react"
import { useState } from "react"

interface AdditionalServicesCardProps {
  onSubmit: (warehouseNeeded: boolean, logisticsNeeded: boolean) => void
  disabled?: boolean
}

const AdditionalServicesCard: React.FC<AdditionalServicesCardProps> = ({ onSubmit, disabled = false }) => {
  const [warehouseNeeded, setWarehouseNeeded] = useState(false)
  const [logisticsNeeded, setLogisticsNeeded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(warehouseNeeded, logisticsNeeded)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 bg-white rounded-lg shadow-md border border-gray-200 ${disabled ? "opacity-70 pointer-events-none" : ""}`}
    >
      <h2 className="text-lg font-medium mb-4">Additional Services</h2>
      <p className="text-sm text-gray-600 mb-4">Select any additional services you may need for your order.</p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Do you want to select a Warehouse Partner</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={warehouseNeeded}
              onChange={() => setWarehouseNeeded(!warehouseNeeded)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Do you want to select a Logistics Partner</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={logisticsNeeded}
              onChange={() => setLogisticsNeeded(!logisticsNeeded)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  )
}

export default AdditionalServicesCard
