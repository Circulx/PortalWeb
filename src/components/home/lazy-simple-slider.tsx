"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { SectionSkeleton } from "@/components/layout/section-skeleton"

const SimpleSlider = dynamic(() => import("@/components/home/SimpleSlider"), {
  loading: () => <SectionSkeleton type="slider" />,
  ssr: false,
})

export function LazySimpleSlider() {
  return (
    <Suspense fallback={<SectionSkeleton type="slider" />}>
      <SimpleSlider />
    </Suspense>
  )
}
