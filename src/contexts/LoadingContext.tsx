"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

type LoadingContextType = {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = useCallback(() => {
    console.log("Starting loading...")
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    console.log("Stopping loading...")
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}
