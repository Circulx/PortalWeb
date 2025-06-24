"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, LogOut, Search } from "lucide-react"
import { AuthModal } from "../auth/auth-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/auth"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useRouter } from "next/navigation"

interface HeaderProps {
  user?: {
    id: string
    name: string
    email: string
    type: "admin" | "seller" | "customer"
  } | null
}

export default function Header({ user }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Get cart and wishlist counts from Redux store
  const cartItemsCount = useSelector((state: RootState) => state.cart.items.length)
  const wishlistItemsCount = useSelector((state: RootState) => state.wishlist.items.length)

  const router = useRouter()

  // List of implemented categories - any others will redirect to coming-soon
  const implementedCategories = ["electronics", "clothing", "home"]

  const categories = [
    "Storage Tanks, Drums",
    "Oils, Grease & Lubricants",
    "Heater, Thermostat",
    "Wire Mesh & Gratings",
    "Containers",
    "Papers",
    "Gratings",
   
    "Machines",
    "Cosmetcis",
    "Mobile & Computers",
    "Papers",
    "Gratings",
  ]

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

  // Handle category navigation - redirect to coming-soon for unimplemented categories
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    if (!implementedCategories.includes(categorySlug)) {
      e.preventDefault()
      router.push("/coming-soon")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Top Navigation - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
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
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 sm:h-10 lg:h-11 pl-9 sm:pl-10 pr-4 text-sm sm:text-base 
                      border border-gray-300 rounded-full 
                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                      transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </form>
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
                        border-gray-300 hover:border-gray-400 transition-colors"
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
      </div>

      {/* Spacer for fixed header */}
      <div className="h-12 sm:h-14 lg:h-16"></div>

      {/* Categories Navigation */}
      <div className="bg-orange-500 text-white overflow-x-auto">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center py-2 sm:py-2.5 lg:py-3 space-x-4 sm:space-x-6 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-medium hidden sm:inline flex-shrink-0">Explore:</span>
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-xs sm:text-sm hover:text-gray-200 transition-colors flex-shrink-0"
                onClick={(e) => handleCategoryClick(e, category)}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </header>
  )
}
