"use client"

import { Search } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1) // For keyboard navigation
  const router = useRouter()
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Fetch suggestions from the API whenever the search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([])
      setHighlightedIndex(-1)
      return
    }
    const fetchSuggestions = async () => {
      const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await res.json()
      setFilteredSuggestions(data)
      setHighlightedIndex(-1)
    }
    fetchSuggestions()
  }, [searchQuery])

  // Update search query as user types
  const handleInputChange = (e) => setSearchQuery(e.target.value)

  // Handle keyboard events for accessibility
  const handleKeyDown = (e) => {
    if (filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        // Move highlight down
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredSuggestions.length - 1))
      } else if (e.key === "ArrowUp") {
        // Move highlight up
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0) {
          // If a suggestion is highlighted, go to its page
          const product = filteredSuggestions[highlightedIndex]
          setFilteredSuggestions([])
          inputRef.current.blur()
          router.push(`/products/${product.product_id}`)
        } else if (searchQuery.trim()) {
          // Otherwise, search for the query
          setFilteredSuggestions([])
          inputRef.current.blur()
          router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
      } else if (e.key === "Escape") {
        setFilteredSuggestions([])
        setHighlightedIndex(-1)
        inputRef.current.blur()
      }
    } else if (e.key === "Enter" && searchQuery.trim()) {
      setFilteredSuggestions([])
      inputRef.current.blur()
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    setSearchQuery(product.title)
    setFilteredSuggestions([])
    setHighlightedIndex(-1)
    inputRef.current.blur()
    router.push(`/products/${product.product_id}`)
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* Search icon inside the input */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black placeholder-black"
          autoComplete="off"
        />
        {/* Suggestions dropdown */}
        {searchQuery && (
          <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            <ul className="list-none p-0 m-0" ref={suggestionsRef}>
              {filteredSuggestions.length === 0 ? (
                <li //className="px-4 py-2 text-gray-400 text-sm">No results found
                ></li>
              ) : (
                filteredSuggestions.map((product, idx) => (
                  <li
                    key={product.product_id}
                    className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-black ${
                      idx === highlightedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                    }`}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                    onClick={() => handleSuggestionClick(product)}
                  >
                    {product.image_link && (
                      <img
                        src={product.image_link}
                        alt={product.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-black">{product.title}</div>
                      <div className="text-xs text-black">{product.brand || product.category_name}</div>
                      <div className="text-xs text-orange-600 font-semibold">₹{product.price}</div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar