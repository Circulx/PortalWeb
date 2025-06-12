"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { fetchProducts, fetchProductsByCategory } from "@/store/slices/productSlice"
import { LazySection } from "./lazy-section"
import { SectionSkeleton } from "./section-skeleton"

// Loading skeleton component
const Skeleton = ({ className = "", ...props }: { className?: string; [key: string]: any }) => {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} {...props} />
}

// Loading placeholder component
function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 h-[350px] flex flex-col">
      <Skeleton className="w-full h-40 rounded-md mb-4" />
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-2" />
      <Skeleton className="w-1/4 h-4 mb-4" />
      <div className="mt-auto">
        <Skeleton className="w-2/3 h-6" />
      </div>
    </div>
  )
}

interface Product {
  product_id: number
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: object
  image_link: string
  stock: number
  price: number
  discount: number
  SKU: string
  seller_id: number
  created_at?: string
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

function ProductCarousel({
  products,
  title,
  isLoading,
  category,
  onLoadMore,
}: {
  products: Product[]
  title: string
  isLoading: boolean
  category?: string
  onLoadMore?: () => void
}) {
  const [startIndex, setStartIndex] = useState(0)
  const [visibleProducts, setVisibleProducts] = useState(6)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setVisibleProducts(6)
      } else if (window.innerWidth >= 1024) {
        setVisibleProducts(4)
      } else if (window.innerWidth >= 768) {
        setVisibleProducts(3)
      } else if (window.innerWidth >= 640) {
        setVisibleProducts(2)
      } else {
        setVisibleProducts(1)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Endless carousel logic
  const handlePrevious = () => {
    setStartIndex((prevIndex) => (prevIndex === 0 ? Math.max(0, products.length - visibleProducts) : prevIndex - 1))
  }

  const handleNext = () => {
    setStartIndex((prevIndex) => {
      const nextIndex = prevIndex >= products.length - visibleProducts ? 0 : prevIndex + 1

      // Load more products when reaching near the end
      if (nextIndex >= products.length - visibleProducts - 2 && onLoadMore) {
        onLoadMore()
      }

      return nextIndex
    })
  }

  // Ensure we don't go out of bounds
  const safeStartIndex = Math.min(startIndex, Math.max(0, products.length - visibleProducts))
  const currentProducts = products.slice(safeStartIndex, safeStartIndex + visibleProducts)

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      <div className="relative">
        <div className="flex overflow-hidden">
          {isLoading ? (
            Array(visibleProducts)
              .fill(0)
              .map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className={`w-full px-2 ${
                    visibleProducts === 1
                      ? "sm:w-full"
                      : visibleProducts === 2
                        ? "sm:w-1/2"
                        : visibleProducts === 3
                          ? "sm:w-1/2 md:w-1/3"
                          : visibleProducts === 4
                            ? "sm:w-1/2 md:w-1/3 lg:w-1/4"
                            : "sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
                  }`}
                >
                  <ProductCardSkeleton />
                </div>
              ))
          ) : products.length > 0 ? (
            currentProducts.map((product) => (
              <div
                key={product.product_id}
                className={`w-full px-2 ${
                  visibleProducts === 1
                    ? "sm:w-full"
                    : visibleProducts === 2
                      ? "sm:w-1/2"
                      : visibleProducts === 3
                        ? "sm:w-1/2 md:w-1/3"
                        : visibleProducts === 4
                          ? "sm:w-1/2 md:w-1/3 lg:w-1/4"
                          : "sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
                }`}
              >
                <ProductCard
                  title={product.title}
                  company={product.seller_name}
                  location={product.location}
                  price={product.price}
                  discount={product.discount}
                  image_link={product.image_link || "/placeholder.svg?height=200&width=200"}
                  href={`/products/${product.product_id}`}
                  rating={product.rating}
                  originalPrice={product.price + product.discount}
                  hoverImage={product.image_link || "/placeholder.svg?height=200&width=200"}
                  seller_id={product.seller_id}
                  stock={product.stock}
                />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">No products available in this category</p>
            </div>
          )}
        </div>
        {!isLoading && products.length > visibleProducts && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10 bg-white bg-opacity-50 hover:bg-opacity-75 text-gray-800"
              aria-label="Next product"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Lazy loaded category section
function LazyCategorySection({
  category,
  subcategories,
}: {
  category: string
  subcategories: Record<string, Product[]>
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [hasLoadedMore, setHasLoadedMore] = useState(false)

  const handleLoadMore = () => {
    if (!hasLoadedMore) {
      dispatch(fetchProductsByCategory(category))
      setHasLoadedMore(true)
    }
  }

  return (
    <LazySection delay={200} fallback={<SectionSkeleton type="grid" />} className="mb-12">
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{category}</h2>
        {Object.entries(subcategories).map(([subcategory, products]) => (
          <div key={subcategory} className="mb-8">
            <ProductCarousel
              products={products}
              title={subcategory}
              isLoading={false}
              category={category}
              onLoadMore={handleLoadMore}
            />
          </div>
        ))}
      </div>
    </LazySection>
  )
}

export default function ProductGrid() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    products: allProducts,
    categorySubcategoryProducts,
    status,
    error,
  } = useSelector((state: RootState) => state.products)

  const isLoading = status === "loading"
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  useEffect(() => {
    // Only fetch initial products if they haven't been loaded yet
    if (status === "idle") {
      dispatch(fetchProducts({ limit: 30 })).then(() => {
        setInitialLoadComplete(true)
      })
    } else if (status === "succeeded") {
      setInitialLoadComplete(true)
    }
  }, [dispatch, status])

  // Render product carousels for each category with lazy loading
  const renderCategorySubcategoryCarousels = () => {
    if (Object.keys(categorySubcategoryProducts).length === 0) {
      if (isLoading || !initialLoadComplete) {
        return (
          <>
            <SectionSkeleton type="grid" className="mb-8" />
            <SectionSkeleton type="grid" className="mb-8" />
            <SectionSkeleton type="grid" className="mb-8" />
          </>
        )
      }

      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available</p>
        </div>
      )
    }

    // Split categories for progressive loading
    const categories = Object.entries(categorySubcategoryProducts)
    const firstCategory = categories[0]
    const remainingCategories = categories.slice(1)

    return (
      <>
        {/* Load first category immediately */}
        {firstCategory && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{firstCategory[0]}</h2>
            {Object.entries(firstCategory[1]).map(([subcategory, products]) => (
              <div key={subcategory} className="mb-8">
                <ProductCarousel
                  products={products}
                  title={subcategory}
                  isLoading={isLoading}
                  category={firstCategory[0]}
                />
              </div>
            ))}
          </div>
        )}

        {/* Lazy load remaining categories */}
        {remainingCategories.map(([category, subcategories]) => (
          <LazyCategorySection key={category} category={category} subcategories={subcategories} />
        ))}
      </>
    )
  }

  return (
    <div className="w-full px-4 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          {status === "loading" && <span className="ml-2">Retrying...</span>}
        </div>
      )}

      {renderCategorySubcategoryCarousels()}
    </div>
  )
}
