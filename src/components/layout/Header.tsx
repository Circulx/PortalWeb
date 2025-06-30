"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, LogOut } from "lucide-react"
import { AuthModal } from "../auth/auth-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/auth"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useRouter } from "next/navigation"
import EnhancedSearchBar from "./enhanced-search-bar"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
    type: "admin" | "seller" | "customer"
  } | null
}

interface Category {
  name: string
  count: number
  sampleImage: string
  avgPrice: number
  subcategories: string[]
}

export default function Header({ user }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Get cart and wishlist counts from Redux store
  const cartItemsCount = useSelector((state: RootState) => state.cart.items.length)
  const wishlistItemsCount = useSelector((state: RootState) => state.wishlist.items.length)

  const router = useRouter()

  // Auto-scroll settings
  const SCROLL_INTERVAL = 5000 // 5 seconds
  const CATEGORIES_PER_VIEW = 8 // Number of categories visible at once on desktop

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.error("Failed to fetch categories")
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (categories.length <= CATEGORIES_PER_VIEW) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Move one category at a time, creating infinite loop
        return (prevIndex + 1) % categories.length
      })
    }, SCROLL_INTERVAL)

    return () => clearInterval(interval)
  }, [categories.length])

  // Get visible categories for current view
  const getVisibleCategories = () => {
    if (categories.length === 0) return []

    const visibleCategories = []
    for (let i = 0; i < CATEGORIES_PER_VIEW; i++) {
      const categoryIndex = (currentIndex + i) % categories.length
      visibleCategories.push(categories[categoryIndex])
    }
    return visibleCategories
  }

  function handleAuthSuccess() {
    setIsAuthModalOpen(false)
    if (user) {
      if (user.type === "admin") {
        router.push("/admin")
      } else if (user.type === "seller") {
        router.push("/seller")
      } else {
        router.push("/dashboard")
      }
    } else {
      window.location.reload()
    }
  }

  function navigateToDashboard() {
    if (user) {
      if (user.type === "admin") {
        router.push("/admin")
      } else if (user.type === "seller") {
        router.push("/seller")
      } else {
        router.push("/dashboard")
      }
    } else {
      setIsAuthModalOpen(true)
    }
  }

  // Handle category navigation
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    // You can add logic here to handle category navigation
    // For now, it will navigate to the category page
  }

  const visibleCategories = getVisibleCategories()

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Complete Header Container - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Top Navigation */}
        <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white">
          {/* Main Navigation Layout */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">
            {/* Logo - Left Side */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo1.png"
                  alt="IND2B Logo"
                  width={120}
                  height={80}
                  className="w-16 h-16 sm:w-18 sm:h-18 lg:w-12 lg:h-10 object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Search Bar - Center (Takes remaining space) */}
            <div className="flex-1 max-w-2xl mx-auto">
              <EnhancedSearchBar />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              {/* Wishlist */}
              <Link
                href="/dashboard/wishlist"
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 transition-colors" />
                {wishlistItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white 
                    text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {wishlistItemsCount > 99 ? "99+" : wishlistItemsCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Image src="/cart.png" alt="Shopping Cart" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white 
                    text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {cartItemsCount > 99 ? "99+" : cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Authentication */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 sm:h-9 lg:h-10 px-2 sm:px-3 flex items-center gap-1.5 sm:gap-2 
                        border-gray-300 hover:border-gray-400 transition-colors bg-transparent"
                    >
                      <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                        <AvatarFallback className="text-xs sm:text-sm">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-xs sm:text-sm font-medium">{user.name.split(" ")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={navigateToDashboard} className="cursor-pointer">
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="h-8 sm:h-9 lg:h-10 px-3 sm:px-4 lg:px-6 
                    bg-emerald-500 hover:bg-emerald-600 text-white 
                    text-xs sm:text-sm lg:text-base font-medium 
                    rounded-md transition-colors"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Categories Navigation - Part of Fixed Header */}
        <div className="bg-orange-500 text-white overflow-hidden">
          <div className="w-full px-2 sm:px-3 lg:px-4">
            <div className="flex items-center py-2 sm:py-2.5 lg:py-3">
              {/* Explore Label */}
              <span className="text-xs sm:text-sm font-medium hidden sm:inline flex-shrink-0 mr-4 sm:mr-6">
                Explore:
              </span>

              {/* Categories Container */}
              <div className="flex-1 overflow-hidden">
                {isLoading ? (
                  // Loading state
                  <div className="flex space-x-4 sm:space-x-6 animate-pulse">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="h-4 bg-orange-400 rounded w-16 sm:w-18 flex-shrink-0"></div>
                    ))}
                  </div>
                ) : (
                  // Categories with auto-scroll animation
                  <div className="relative">
                    <div
                      className="flex space-x-4 sm:space-x-6 transition-transform duration-1000 ease-in-out"
                      style={{
                        transform:
                          categories.length > CATEGORIES_PER_VIEW
                            ? `translateX(-${(currentIndex * 100) / categories.length}%)`
                            : "translateX(0)",
                      }}
                    >
                      {/* Render all categories for smooth infinite scroll */}
                      {categories.concat(categories).map((category, index) => (
                        <Link
                          key={`${category.name}-${index}`}
                          href={`/categories/${encodeURIComponent(category.name)}`}
                          className="text-xs sm:text-sm hover:text-gray-200 transition-colors flex-shrink-0 whitespace-nowrap"
                          onClick={(e) => handleCategoryClick(e, category.name)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scroll Indicators */}
              {!isLoading && categories.length > CATEGORIES_PER_VIEW && (
                <div className="hidden lg:flex items-center ml-4 space-x-1">
                  {Array.from({ length: Math.min(categories.length, 10) }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index === currentIndex % Math.min(categories.length, 10) ? "bg-white w-3" : "bg-orange-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for complete fixed header (including orange section) */}
      <div className="h-20 sm:h-24 lg:h-28"></div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </header>
  )
}
