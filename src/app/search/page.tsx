"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"
import Link from "next/link"

type Product = {
  product_id: string
  title: string
  image_link?: string
  brand?: string
  category_name?: string
  price: number
  rating?: number
  stock?: number
  discount?: number
  seller_name?: string
  sub_category_name?: string
  delivery_option?: string
}

function handleAddToCart(product: Product) {
  alert(`Added "${product.title}" to cart!`)
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [results, setResults] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [category, setCategory] = useState<string>("")
  const [brands, setBrands] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [minRating, setMinRating] = useState<string>("")
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [minDiscount, setMinDiscount] = useState<string>("")
  const [seller, setSeller] = useState<string>("")
  const [subCategory, setSubCategory] = useState<string>("")

  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [tempFilters, setTempFilters] = useState<any>({})

  // View mode state: "grid" or "list"
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (!query) return
    fetch(`/api/products?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then((data: Product[]) => {
        setResults(data)
        setFiltered(data)
        const uniqueBrands = Array.from(new Set(data.map(p => p.brand).filter(Boolean) as string[]))
        setBrands(uniqueBrands)
        const prices = data.map(p => p.price).filter(Number.isFinite)
        if (prices.length) {
          setPriceRange([Math.min(...prices), Math.max(...prices)])
        }
      })
  }, [query])

  useEffect(() => {
    let filteredData = results
    if (category) {
      filteredData = filteredData.filter(p => (p.category_name || "").toLowerCase().includes(category.toLowerCase()))
    }
    if (selectedBrands.length > 0) {
      filteredData = filteredData.filter(p => selectedBrands.includes(p.brand || ""))
    }
    filteredData = filteredData.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (minPrice) {
      filteredData = filteredData.filter(p => p.price >= Number(minPrice))
    }
    if (maxPrice) {
      filteredData = filteredData.filter(p => p.price <= Number(maxPrice))
    }
    if (minRating) {
      filteredData = filteredData.filter(p => (p.rating || 0) >= Number(minRating))
    }
    if (inStockOnly) {
      filteredData = filteredData.filter(p => (p.stock || 0) > 0)
    }
    if (minDiscount) {
      filteredData = filteredData.filter(p => (p.discount || 0) >= Number(minDiscount))
    }
    if (seller) {
      filteredData = filteredData.filter(p => (p.seller_name || "").toLowerCase().includes(seller.toLowerCase()))
    }
    if (subCategory) {
      filteredData = filteredData.filter(p => (p.sub_category_name || "").toLowerCase().includes(subCategory.toLowerCase()))
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

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]])
    }
  }

  const openMobileFilters = () => {
    setTempFilters({
      category,
      selectedBrands: [...selectedBrands],
      priceRange: [...priceRange],
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      minDiscount,
      seller,
      subCategory,
    })
    setShowMobileFilters(true)
  }

  const cancelMobileFilters = () => {
    setShowMobileFilters(false)
  }

  const applyMobileFilters = () => {
    setCategory(tempFilters.category)
    setSelectedBrands(tempFilters.selectedBrands)
    setPriceRange(tempFilters.priceRange)
    setMinPrice(tempFilters.minPrice)
    setMaxPrice(tempFilters.maxPrice)
    setMinRating(tempFilters.minRating)
    setInStockOnly(tempFilters.inStockOnly)
    setMinDiscount(tempFilters.minDiscount)
    setSeller(tempFilters.seller)
    setSubCategory(tempFilters.subCategory)
    setShowMobileFilters(false)
  }

  const handleTempChange = (field: string, value: any) => {
    setTempFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTempBrandChange = (brand: string) => {
    setTempFilters((prev: any) => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter((b: string) => b !== brand)
        : [...prev.selectedBrands, brand],
    }))
  }

  const handleTempSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setTempFilters((prev: any) => ({
        ...prev,
        priceRange: [value[0], value[1]],
      }))
    }
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Smaller heading, less space */}
      <h1 className="text-base sm:text-lg font-semibold mb-2 text-black text-center sm:text-left">
        Search Results for <span className="font-normal text-gray-700">"{query}"</span>
      </h1>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Desktop/Tablet: show sidebar filters */}
        <aside className="w-full md:max-w-xs bg-white border rounded p-4 hidden md:block">
          <h2 className="font-semibold mb-2 text-black">Filters</h2>
          {/* ...filters unchanged... */}
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="Category name"
            />
          </div>
          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Brand</label>
            <div className="max-h-32 overflow-y-auto border rounded px-2 py-1 bg-white">
              {brands.length === 0 && <div className="text-xs text-gray-400">No brands found</div>}
              {brands.map(brand => (
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
                min={results.length ? Math.min(...results.map(p => p.price)) : 0}
                max={results.length ? Math.max(...results.map(p => p.price)) : 10000}
                value={priceRange}
                onChange={handleSliderChange}
                allowCross={false}
                trackStyle={[{ backgroundColor: "#2563eb" }]}
                handleStyle={[
                  { borderColor: "#2563eb", backgroundColor: "#fff" },
                  { borderColor: "#2563eb", backgroundColor: "#fff" }
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
                onChange={e => setMinPrice(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1 text-black">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                placeholder="10000"
              />
            </div>
          </div>
          {/* Minimum Rating Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Minimum Rating</label>
            <input
              type="number"
              min={0}
              max={5}
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="e.g. 4"
            />
          </div>
          {/* In Stock Only Filter */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
              />
              In Stock Only
            </label>
          </div>
          {/* Minimum Discount Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Minimum Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minDiscount}
              onChange={e => setMinDiscount(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="e.g. 10"
            />
          </div>
          {/* Seller Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Seller</label>
            <input
              type="text"
              value={seller}
              onChange={e => setSeller(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="Seller name"
            />
          </div>
          {/* Sub-category Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-medium text-black">Sub-category</label>
            <input
              type="text"
              value={subCategory}
              onChange={e => setSubCategory(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
              placeholder="Sub-category"
            />
          </div>
        </aside>

        {/* Mobile/Tablet: show filter button and modal */}
        <div className="block md:hidden w-full">
          {/* Filter and layout toggle in the same row */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded font-semibold"
              onClick={openMobileFilters}
            >
              Filters
            </button>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded border text-sm font-medium ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border-blue-600"}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                Grid
              </button>
              <button
                className={`px-3 py-1 rounded border text-sm font-medium ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border-blue-600"}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                List
              </button>
            </div>
          </div>
          {/* Mobile filter modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-4 relative">
                <h2 className="font-semibold mb-2 text-black text-lg">Filters</h2>
                {/* ...filters unchanged... */}
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-black">Category</label>
                  <input
                    type="text"
                    value={tempFilters.category}
                    onChange={e => handleTempChange("category", e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                    placeholder="Category name"
                  />
                </div>
                {/* Brand Filter */}
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-black">Brand</label>
                  <div className="max-h-32 overflow-y-auto border rounded px-2 py-1 bg-white">
                    {brands.length === 0 && <div className="text-xs text-gray-400">No brands found</div>}
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2 text-sm mb-1 cursor-pointer text-black">
                        <input
                          type="checkbox"
                          checked={tempFilters.selectedBrands?.includes(brand)}
                          onChange={() => handleTempBrandChange(brand)}
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
                      min={results.length ? Math.min(...results.map(p => p.price)) : 0}
                      max={results.length ? Math.max(...results.map(p => p.price)) : 10000}
                      value={tempFilters.priceRange}
                      onChange={handleTempSliderChange}
                      allowCross={false}
                      trackStyle={[{ backgroundColor: "#2563eb" }]}
                      handleStyle={[
                        { borderColor: "#2563eb", backgroundColor: "#fff" },
                        { borderColor: "#2563eb", backgroundColor: "#fff" }
                      ]}
                    />
                    <div className="flex justify-between text-xs mt-2 text-black">
                      <span>₹{tempFilters.priceRange?.[0]}</span>
                      <span>₹{tempFilters.priceRange?.[1]}</span>
                    </div>
                  </div>
                </div>
                {/* Min/Max Price Inputs */}
                <div className="mb-4 flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 text-black">Min Price</label>
                    <input
                      type="number"
                      value={tempFilters.minPrice}
                      onChange={e => handleTempChange("minPrice", e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1 text-black">Max Price</label>
                    <input
                      type="number"
                      value={tempFilters.maxPrice}
                      onChange={e => handleTempChange("maxPrice", e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                      placeholder="10000"
                    />
                  </div>
                </div>
                {/* Minimum Rating Filter */}
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-black">Minimum Rating</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={tempFilters.minRating}
                    onChange={e => handleTempChange("minRating", e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                    placeholder="e.g. 4"
                  />
                </div>
                {/* In Stock Only Filter */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-black">
                    <input
                      type="checkbox"
                      checked={tempFilters.inStockOnly}
                      onChange={e => handleTempChange("inStockOnly", e.target.checked)}
                    />
                    In Stock Only
                  </label>
                </div>
                {/* Minimum Discount Filter */}
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-black">Minimum Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tempFilters.minDiscount}
                    onChange={e => handleTempChange("minDiscount", e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                    placeholder="e.g. 10"
                  />
                </div>
                {/* Seller Filter */}
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-black">Seller</label>
                  <input
                    type="text"
                    value={tempFilters.seller}
                    onChange={e => handleTempChange("seller", e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                    placeholder="Seller name"
                  />
                </div>
                {/* Sub-category Filter */}
                <div className="mb-4">
                  <label className="block text-sm mb-1 font-medium text-black">Sub-category</label>
                  <input
                    type="text"
                    value={tempFilters.subCategory}
                    onChange={e => handleTempChange("subCategory", e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-white text-black placeholder-black"
                    placeholder="Sub-category"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 text-black font-medium"
                    onClick={cancelMobileFilters}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white font-medium"
                    onClick={applyMobileFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <main className="flex-1">
          {/* Desktop: filter and layout toggle in same row */}
          <div className="hidden md:flex items-center justify-end mb-4 gap-2">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded border text-sm font-medium ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border-blue-600"}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                Grid
              </button>
              <button
                className={`px-3 py-1 rounded border text-sm font-medium ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border-blue-600"}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                List
              </button>
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="text-black">No products found.</p>
          ) : (
            <>
              {/* Grid/List rendering */}
              {viewMode === "grid" ? (
                // Responsive grid: 1 col on xs, 2 on sm (including mobile landscape), 3 on lg
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(product => (
                    <li key={product.product_id} className="border rounded p-3 sm:p-4 flex flex-col items-start bg-white transition-shadow hover:shadow-lg">
                      <Link
                        key={product.product_id}
                        href={`/products/${product.product_id}`}
                        className="block w-full"
                        style={{ textDecoration: "none" }}
                      >
                        {/* Image container for consistent sizing */}
                        <div className="w-full h-36 sm:h-40 flex items-center justify-center bg-white mb-2">
                          {product.image_link && (
                            <img
                              src={product.image_link}
                              alt={product.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                        {/* Product title truncated for grid */}
                        <div className="font-semibold text-base sm:text-lg text-black truncate">{product.title}</div>
                        <div className="text-xs sm:text-sm text-black mb-1">{product.brand || product.category_name}</div>
                        <div className="text-orange-600 font-bold mb-1 text-sm sm:text-base">₹{product.price}</div>
                        {/* Rating */}
                        <div className="flex items-center mb-1">
                          <span className="text-yellow-500 mr-1 text-xs sm:text-base">
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
                      <button
                        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs sm:text-sm font-medium w-full"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                // List view: horizontal on desktop, stacked on mobile
                <ul className="flex flex-col gap-4">
                  {filtered.map(product => (
                    <li
                      key={product.product_id}
                      className="border rounded p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center bg-white transition-shadow hover:shadow-lg"
                    >
                      <Link
                        key={product.product_id}
                        href={`/products/${product.product_id}`}
                        className="flex-shrink-0 w-full sm:w-40 h-36 sm:h-40 flex items-center justify-center bg-white mb-2 sm:mb-0 sm:mr-4"
                        style={{ textDecoration: "none" }}
                      >
                        {product.image_link && (
                          <img
                            src={product.image_link}
                            alt={product.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        )}
                      </Link>
                      <div className="flex-1 w-full">
                        <Link
                          href={`/products/${product.product_id}`}
                          className="block"
                          style={{ textDecoration: "none" }}
                        >
                          {/* Product title truncated for list, max-w to avoid overflow */}
                          <div className="font-semibold text-base sm:text-lg text-black mb-1 truncate max-w-full sm:max-w-[28rem]">
                            {product.title}
                          </div>
                          <div className="text-xs sm:text-sm text-black mb-1">{product.brand || product.category_name}</div>
                          <div className="text-orange-600 font-bold mb-1 text-sm sm:text-base">₹{product.price}</div>
                          {/* Rating */}
                          <div className="flex items-center mb-1">
                            <span className="text-yellow-500 mr-1 text-xs sm:text-base">
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
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-auto mt-2 sm:mt-0"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}