"use client"

import { Search } from "lucide-react"
import { useState, useEffect } from "react"

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  const handleInputChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim()) {
      const matches = products.filter((product) => {
        const titleMatch = product.title.toLowerCase().includes(query.toLowerCase())
        const descriptionMatch = product.description?.toLowerCase().includes(query.toLowerCase())
        return titleMatch || descriptionMatch
      })
      setFilteredSuggestions(matches)
    } else {
      setFilteredSuggestions([])
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleInputChange}
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {filteredSuggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
            <ul className="list-none p-0 m-0">
              {filteredSuggestions.map((product) => (
                <li
                  key={product.product_id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchQuery(product.title)
                    setFilteredSuggestions([])
                  }}
                >
                  {product.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar
