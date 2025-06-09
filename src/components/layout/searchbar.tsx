"use client"

import { Search } from "lucide-react"
import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent, FocusEvent, MouseEvent } from "react"
import { useRouter } from "next/navigation"

type ProductSuggestion = {
  product_id: string
  title: string
  brand?: string
  category_name?: string
  price?: number | string
  image_link?: string
}

// Dummy best sellers (replace with real API in production)
const DUMMY_BEST_SELLERS: ProductSuggestion[] = [
  { product_id: "b1", title: "Bosch Cordless Drill", brand: "Bosch", category_name: "Tools", price: 2999, image_link: "/dummy/bosch.jpg" },
  { product_id: "b2", title: "Philips LED Bulb", brand: "Philips", category_name: "Electronics", price: 199, image_link: "/dummy/philips.jpg" },
  { product_id: "b3", title: "Asian Paints Emulsion", brand: "Asian Paints", category_name: "Paints", price: 1200, image_link: "/dummy/asianpaints.jpg" },
  { product_id: "b4", title: "Stanley Hammer", brand: "Stanley", category_name: "Tools", price: 499, image_link: "/dummy/stanley.jpg" },
  { product_id: "b5", title: "Havells Wire", brand: "Havells", category_name: "Electronics", price: 899, image_link: "/dummy/havells.jpg" },
]

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredSuggestions, setFilteredSuggestions] = useState<ProductSuggestion[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [justSelected, setJustSelected] = useState<boolean>(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLUListElement>(null)

  // Fetch suggestions from the API whenever the search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([])
      setHighlightedIndex(-1)
      setShowSuggestions(false)
      return
    }
    const fetchSuggestions = async () => {
      const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data: ProductSuggestion[] = await res.json()
      setFilteredSuggestions(data)
      setHighlightedIndex(-1)
      if (!justSelected) setShowSuggestions(true)
    }
    fetchSuggestions()
  }, [searchQuery, justSelected])

  // Close suggestions when clicking outside the input or dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Show suggestions on input focus if there are suggestions and not just after selection
  const handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length > 0 && !justSelected) setShowSuggestions(true)
    setJustSelected(false)
  }

  // Update search query as user types
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSuggestions(true)
    setJustSelected(false)
  }

  // Keyboard navigation and selection
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length > 0 && showSuggestions) {
      if (e.key === "ArrowDown") {
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1))
      } else if (e.key === "ArrowUp") {
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0) {
          // Select the highlighted suggestion
          const product = filteredSuggestions[highlightedIndex]
          setSearchQuery(product.title)
          setFilteredSuggestions([])
          setHighlightedIndex(-1)
          setShowSuggestions(false)
          setJustSelected(true)
          inputRef.current?.blur()
          router.push(`/products/${product.product_id}`)
        } else if (searchQuery.trim()) {
          setFilteredSuggestions([])
          setHighlightedIndex(-1)
          setShowSuggestions(false)
          setJustSelected(false)
          inputRef.current?.blur()
          router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        setJustSelected(false)
        inputRef.current?.blur()
      }
    } else if (e.key === "Enter" && searchQuery.trim()) {
      setFilteredSuggestions([])
      setHighlightedIndex(-1)
      setShowSuggestions(false)
      setJustSelected(false)
      inputRef.current?.blur()
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (product: ProductSuggestion) => {
    setSearchQuery(product.title)
    setFilteredSuggestions([])
    setHighlightedIndex(-1)
    setShowSuggestions(false)
    setJustSelected(true)
    inputRef.current?.blur()
    router.push(`/products/${product.product_id}`)
  }

  // Suggest a search item based on what the user is typing
  const suggestSearchItem = searchQuery.trim()
    ? `Search for "${searchQuery.trim()}"`
    : ""

  // Carousel state for best sellers
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselSize = 5

  const handleCarouselPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCarouselIndex((prev) => (prev === 0 ? DUMMY_BEST_SELLERS.length - carouselSize : prev - 1))
  }
  const handleCarouselNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCarouselIndex((prev) => (prev === DUMMY_BEST_SELLERS.length - carouselSize ? 0 : prev + 1))
  }

  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-xl">
        {/* Search input with icon */}
        <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
          <Search className="ml-3 text-gray-500 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="flex-1 py-2 px-3 bg-transparent border-none outline-none text-black placeholder-gray-500 rounded-full"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-activedescendant={
              highlightedIndex >= 0 && showSuggestions
                ? `suggestion-${highlightedIndex}`
                : undefined
            }
          />
        </div>
        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div
            className="absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96"
            style={{ overflowY: "auto", overflowX: "hidden" }}
          >
            <ul
              className="list-none p-0 m-0"
              ref={suggestionsRef}
              id="search-suggestions"
              role="listbox"
            >
              {/* Suggest a search item */}
              {suggestSearchItem && (
                <li
                  key="search-suggestion"
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer text-blue-700 font-medium hover:bg-blue-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowSuggestions(false)
                    setJustSelected(false)
                    inputRef.current?.blur()
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                  }}
                >
                  {suggestSearchItem}
                </li>
              )}
              {/* Product suggestions (with small images) */}
              {filteredSuggestions.map((product, idx) => (
                <li
                  key={product.product_id}
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-black transition ${
                    idx === highlightedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(product)}
                >
                  {product.image_link && (
                    <img
                      src={product.image_link}
                      alt={product.title}
                      className="w-8 h-8 object-contain rounded bg-white border"
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate max-w-xs" title={product.title}>
                      {product.title}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-xs" title={product.brand || product.category_name}>
                      {product.brand || product.category_name}
                    </span>
                    <span className="text-xs text-orange-600 font-semibold truncate max-w-xs">
                      ₹{product.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {/* Best Sellers Carousel after 5th suggestion */}
            {filteredSuggestions.length === 5 && (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex items-center justify-between px-4 mb-2">
                  <span className="text-xs text-gray-500 font-semibold">Best Sellers</span>
                  <div className="flex gap-2">
                    <button
                      aria-label="Previous"
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                      onClick={handleCarouselPrev}
                      tabIndex={-1}
                      type="button"
                    >
                      &#8592;
                    </button>
                    <button
                      aria-label="Next"
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                      onClick={handleCarouselNext}
                      tabIndex={-1}
                      type="button"
                    >
                      &#8594;
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 px-4 pb-2">
                  {DUMMY_BEST_SELLERS.slice(carouselIndex, carouselIndex + carouselSize).map((product) => (
                    <div
                      key={product.product_id}
                      className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(product)}
                      style={{ aspectRatio: "1/1", minWidth: 0 }}
                    >
                      {product.image_link && (
                        <img
                          src={product.image_link}
                          alt={product.title}
                          className="w-10 h-10 object-contain rounded mb-1 bg-white border"
                        />
                      )}
                      <span className="font-medium text-xs text-center truncate w-full" title={product.title}>
                        {product.title}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate w-full text-center" title={product.brand || product.category_name}>
                        {product.brand || product.category_name}
                      </span>
                      <span className="text-xs text-orange-600 font-semibold truncate w-full text-center">
                        ₹{product.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Show "No results found" only if there is a query and no suggestions */}
            {searchQuery && filteredSuggestions.length === 0 && (
              <li className="px-4 py-3 text-gray-400 text-sm select-none">No results found</li>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar