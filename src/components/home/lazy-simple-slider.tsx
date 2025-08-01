"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the SimpleSlider component
const SimpleSlider = dynamic(() => import("./SimpleSlider"), {
  ssr: true,
  loading: () => (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gray-100 animate-pulse">
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="text-gray-400">Loading ...</div>
      </div>
    </div>
  ),
})

export function LazySimpleSlider() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-gray-100 animate-pulse">
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <div className="text-gray-400">Loading advertisements...</div>
          </div>
        </div>
      }
    >
      <SimpleSlider />
    </Suspense>
  )
}
