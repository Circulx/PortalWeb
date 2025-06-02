"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
// import SearchBar from "@/components/layout/searchbar"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import Link from "next/link"
import { Suspense } from "react"

function handleAddToCart(product) {
  // Example: dispatch(addToCart(product)) if using Redux
  // Or call your API/context here
  alert(`Added "${product.title}" to cart!`)
}

function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState("")
  const [brands, setBrands] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  // New filters
  const [minRating, setMinRating] = useState("")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minDiscount, setMinDiscount] = useState("")
  const [seller, setSeller] = useState("")
  const [subCategory, setSubCategory] = useState("")

  // Fetch products matching the search query from the API
  useEffect(() => {
    if (!query) return
    fetch(`/api/products?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data)
        setFiltered(data)
        // Extract unique brands for filter
        const uniqueBrands = Array.from(new Set(data.map((p) => p.brand).filter(Boolean)))
        setBrands(uniqueBrands)
        // Set price range slider min/max
        const prices = data.map((p) => p.price).filter(Number.isFinite)
        if (prices.length) {
          setPriceRange([Math.min(...prices), Math.max(...prices)])
        }
      })
  }, [query])

  // Instant filter application
  useEffect(() => {
    let filteredData = results
    if (category) {
      filteredData = filteredData.filter((p) => (p.category_name || "").toLowerCase().includes(category.toLowerCase()))
    }
    if (selectedBrands.length > 0) {
      filteredData = filteredData.filter((p) => selectedBrands.includes(p.brand))
    }
    filteredData = filteredData.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (minPrice) {
      filteredData = filteredData.filter((p) => p.price >= Number(minPrice))
    }
    if (maxPrice) {
      filteredData = filteredData.filter((p) => p.price <= Number(maxPrice))
    }
    // New filters
    if (minRating) {
      filteredData = filteredData.filter((p) => (p.rating || 0) >= Number(minRating))
    }
    if (inStockOnly) {
      filteredData = filteredData.filter((p) => p.stock > 0)
    }
    if (minDiscount) {
      filteredData = filteredData.filter((p) => (p.discount || 0) >= Number(minDiscount))
    }
    if (seller) {
      filteredData = filteredData.filter((p) => (p.seller_name || "").toLowerCase().includes(seller.toLowerCase()))
    }
    if (subCategory) {
      filteredData = filteredData.filter((p) =>
        (p.sub_category_name || "").toLowerCase().includes(subCategory.toLowerCase()),
      )
    }
    setFiltered(filteredData)
  }, [
    results,
    category,
    selectedBrands,
    priceRange,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    minDiscount,
    seller,
    subCategory,
  ])

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const handleSliderChange = (range) => {
    setPriceRange(range)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SearchBar at the top */}
      {/* <div className="mb-6">
        <SearchBar />
      </div> */}
      <h1 className="text-2xl font-bold mb-4 text-black">Search Results for "{query}"</h1>
      <div className="flex gap-6">
        {/* LEFT PANEL: FILTERS */}
        <aside className="w-full max-w-xs bg-white border rounded p-4">
          <h2 className="font-semibold mb-2 text-black">Filters</h2>
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="Category name"
            />
          </div>
          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Brand</label>
            <div className="max-h-32 overflow-y-auto border rounded px-2 py-1 bg-white">
              {brands.length === 0 && <div className="text-xs text-gray-400">No brands found</div>}
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 text-sm mb-1 cursor-pointer text-black">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  {brand}
                </label>
              ))}
            </div>
          </div>
          {/* Price Range Slider */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Price Range</label>
            <div className="px-2 py-3">
              <Slider
                range
                min={results.length ? Math.min(...results.map((p) => p.price)) : 0}
                max={results.length ? Math.max(...results.map((p) => p.price)) : 10000}
                value={priceRange}
                onChange={handleSliderChange}
                allowCross={false}
                trackStyle={[{ backgroundColor: "#2563eb" }]}
                handleStyle={[
                  { borderColor: "#2563eb", backgroundColor: "#fff" },
                  { borderColor: "#2563eb", backgroundColor: "#fff" },
                ]}
              />
              <div className="flex justify-between text-xs mt-2 text-black">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </div>
          {/* Min/Max Price Inputs */}
          <div className="mb-4 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1 text-black">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1 text-black">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                placeholder="10000"
              />
            </div>
          </div>
          {/* New Filters */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Minimum Rating</label>
            <input
              type="number"
              min={0}
              max={5}
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="e.g. 4"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-black">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              In Stock Only
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Minimum Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minDiscount}
              onChange={(e) => setMinDiscount(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="e.g. 10"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Seller</label>
            <input
              type="text"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="Seller name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Sub-category</label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="Sub-category"
            />
          </div>
        </aside>
        {/* RIGHT PANEL: RESULTS */}
        <main className="flex-1">
          {filtered.length === 0 ? (
            <p className="text-black">No products found.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <li key={product.product_id} className="border rounded p-4 flex flex-col items-start bg-white">
                  <Link
                    key={product.product_id}
                    href={`/products/${product.product_id}`}
                    className="block"
                    style={{ textDecoration: "none" }} // Optional: remove underline
                  >
                    {product.image_link && (
                      <img
                        src={product.image_link || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    )}
                    <div className="font-semibold text-lg text-black">{product.title}</div>
                    <div className="text-sm text-black mb-1">{product.brand || product.category_name}</div>
                    <div className="text-orange-600 font-bold mb-1">₹{product.price}</div>
                    {/* Rating */}
                    <div className="flex items-center mb-1">
                      <span className="text-yellow-500 mr-1">
                        {product.rating ? "★".repeat(Math.round(product.rating)) : "★"}
                      </span>
                      <span className="text-xs text-black">
                        {product.rating ? product.rating.toFixed(1) : "No rating"}
                      </span>
                    </div>
                    {/* Delivery Option */}
                    <div className="text-xs text-green-700 mb-2">
                      {product.delivery_option || "Free Delivery Available"}
                    </div>
                  </Link>
                  {/* Add to Cart Button */}
                  <button
                    className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  )
}

function SearchResultsPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading search results...</p>
            </div>
          </div>
        </div>
      }
    >
      <SearchResultsPage />
    </Suspense>
  )
}

export default SearchResultsPageWrapper
