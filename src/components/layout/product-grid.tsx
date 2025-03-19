"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"

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
  seller_id?: number
  created_at?: string
  rating: number
  seller_name: string
  location: string
  category_name: string
  sub_category_name: string
}

function ProductCarousel({ products, title, isLoading }: { products: Product[]; title: string; isLoading: boolean }) {
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

  const handlePrevious = () => {
    setStartIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, products.length - visibleProducts) : prevIndex - visibleProducts,
    )
  }

  const handleNext = () => {
    setStartIndex((prevIndex) => (prevIndex + visibleProducts >= products.length ? 0 : prevIndex + visibleProducts))
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
            // Show skeletons when loading
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
            // Show actual products when loaded
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
                  href={`/product/${product.product_id}`}
                  rating={product.rating}
                  originalPrice={product.price + product.discount}
                  hoverImage={product.image_link || "/placeholder.svg?height=200&width=200"}
                />
              </div>
            ))
          ) : (
            // Show message when no products
            <div className="w-full text-center py-8">
              <p className="text-gray-500">No products available in this category</p>
            </div>
          )}
        </div>
        {!isLoading && products.length > visibleProducts && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 shadow-md transition-all duration-200 focus:outline-none z-10"
              aria-label="Next product"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ProductGrid() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categorySubcategoryProducts, setCategorySubcategoryProducts] = useState<
    Record<string, Record<string, Product[]>>
  >({});  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching products from API...")
        const response = await axios.get("/api/products")
        console.log(`Received ${response.data.length} products from API`)

        // Check if we got an error response
        if (response.data.error) {
          throw new Error(response.data.error)
        }

        // Ensure we have an array of products
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format from API")
        }

        const products: Product[] = response.data

        // Add fallback values for missing fields
        const processedProducts = products.map((product) => ({
          ...product,
          seller_name: product.seller_name || "Unknown Seller",
          location: product.location || "Unknown Location",
          rating: product.rating || 0,
          discount: product.discount || 0,
          image_link: product.image_link || "/placeholder.svg?height=200&width=200",
        }))

        setAllProducts(processedProducts)

        // Group products by category and subcategory
        const groupedProducts: Record<string, Record<string, Product[]>> = {};

        processedProducts.forEach((product) => {
          const category = product.category_name || "Uncategorized";
          const subcategory = product.sub_category_name || "Uncategorized";

          if (!groupedProducts[category]) {
            groupedProducts[category] = {};
          }

          if (!groupedProducts[category][subcategory]) {
            groupedProducts[category][subcategory] = [];
          }

          groupedProducts[category][subcategory].push(product);
        });

        setCategorySubcategoryProducts(groupedProducts);
      } catch (error) {
        console.error("Error fetching products:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setError(`Failed to load products: ${errorMessage}. Retrying...`)

        // Retry up to 3 times with increasing delay
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
          setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, delay)
        } else {
          setError("Failed to load products after multiple attempts. Please refresh the page or try again later.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [retryCount])

  // Render product carousels for each category
  const renderCategorySubcategoryCarousels = () => {
    if (Object.keys(categorySubcategoryProducts).length === 0) {
      if (isLoading) {
        return (
          <>
            <ProductCarousel products={[]} title="Loading Products..." isLoading={true} />
            <ProductCarousel products={[]} title="Loading More..." isLoading={true} />
          </>
        )
      }

      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available</p>
        </div>
      )
    }

    return Object.entries(categorySubcategoryProducts).map(([category, subcategories]) => (
      <div key={category} className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{category}</h2>
        {Object.entries(subcategories).map(([subcategory, products]) => (
          <div key={subcategory} className="mb-8">
            <ProductCarousel products={products} title={subcategory} isLoading={isLoading} />
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="w-full px-4 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          {retryCount < 3 && <span className="ml-2">Retrying...</span>}
        </div>
      )}

      {renderCategorySubcategoryCarousels()}
    </div>
  )
}

