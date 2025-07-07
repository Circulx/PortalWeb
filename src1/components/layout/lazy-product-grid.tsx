"use client"

import dynamic from "next/dynamic"
import { SectionSkeleton } from "./section-skeleton"

// Dynamically import ProductGrid without SSR
const ProductGrid = dynamic(() => import("./product-grid"), {
  ssr: false,
  loading: () => <SectionSkeleton type="grid" />,
})

export function LazyProductGrid() {
  // Remove the limit - let ProductGrid fetch all products
  return <ProductGrid />
}
