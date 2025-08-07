"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Remove lazy loading for critical hero content - load immediately
const SimpleSlider = dynamic(() => import("./SimpleSlider"), {
  ssr: true, // Enable SSR for better performance
  loading: () => (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-600 font-medium">Loading hero section...</p>
        </div>
      </div>
    </div>
  ),
})

export function LazySimpleSlider() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-blue-600 font-medium">Initializing...</p>
            </div>
          </div>
        </div>
      }
    >
      <SimpleSlider />
    </Suspense>
  )
}
