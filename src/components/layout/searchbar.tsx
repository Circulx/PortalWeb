"use client"

import { Search } from "lucide-react"
import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent, FocusEvent, MouseEvent } from "react"
import { useRouter } from "next/navigation"

type ProductSuggestion = {
  product_id: string
  title: string
  image_link?: string
  brand?: string
  category_name?: string
  price?: number | string
}

const SearchBar: React.FC = () => {
  // State for the search input, suggestions, highlighted suggestion, and dropdown visibility
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filteredSuggestions, setFilteredSuggestions] = useState<ProductSuggestion[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [justSelected, setJustSelected] = useState<boolean>(false) // Prevents dropdown from popping up after selection
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
      const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data: ProductSuggestion[] = await res.json()
      setFilteredSuggestions(data)
      setHighlightedIndex(-1)
      // Only show suggestions if not just after a selection
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
          // Search for the entered query
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
    setShowSuggestions(false) // Ensure dropdown closes after selection
    setJustSelected(true)
    inputRef.current?.blur()
    router.push(`/products/${product.product_id}`)
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
        {/* Suggestions dropdown - only show when there are suggestions and input is focused */}
        {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
          <div
            className="absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72"
            style={{ overflowY: "auto", overflowX: "hidden" }}
          >
            <ul
              className="list-none p-0 m-0"
              ref={suggestionsRef}
              id="search-suggestions"
              role="listbox"
            >
              {filteredSuggestions.map((product, idx) => (
                <li
                  key={product.product_id}
                  id={`suggestion-${idx}`}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-black transition ${
                    idx === highlightedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onMouseDown={(e) => e.preventDefault()} // Prevent input blur before click
                  onClick={() => handleSuggestionClick(product)}
                >
                  {product.image_link && (
                    <img
                      src={product.image_link}
                      alt={product.title}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span
                      className="font-medium truncate max-w-xs"
                      title={product.title}
                    >
                      {product.title}
                    </span>
                    <span
                      className="text-xs text-gray-500 truncate max-w-xs"
                      title={product.brand || product.category_name}
                    >
                      {product.brand || product.category_name}
                    </span>
                    <span className="text-xs text-orange-600 font-semibold truncate max-w-xs">
                      ₹{product.price}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Show "No results found" only if there is a query and no suggestions */}
        {showSuggestions && searchQuery && filteredSuggestions.length === 0 && (
          <div
            className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            style={{ overflowX: "hidden" }}
          >
            <ul className="list-none p-0 m-0" ref={suggestionsRef}>
              <li className="px-4 py-3 text-gray-400 text-sm select-none">No results found</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar