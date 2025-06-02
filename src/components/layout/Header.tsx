"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, LogOut, Search } from "lucide-react"
import { AuthModal } from "../auth/auth-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/auth"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useRouter } from "next/navigation"
import SearchBar from "@/components/layout/searchbar" // <-- Import your custom SearchBar

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
    "Clothes",
    "Tools",
  ]

  function handleAuthSuccess() {
    setIsAuthModalOpen(false)

    // Redirect to the appropriate dashboard based on user role
    if (user) {
      if (user.type === "admin") {
        router.push("/admin")
      } else if (user.type === "seller") {
        router.push("/seller")
      } else {
        router.push("/dashboard")
      }
    } else {
      // Refresh the page to update the user state
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
    // Convert category to slug format
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    // Check if this category is implemented
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
        <div className="container mx-auto px-2 py-2">
          {/* Main Navigation Row - Single row with all elements */}
          <div className="flex items-center justify-between">
            {/* Logo - Always visible */}
            <Link href="/" className="flex items-center gap-2 min-w-[80px] shrink-0">
              <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold hidden sm:inline">IND2B</span>
            </Link>

            {/* Search Bar - Always visible in the middle */}
            <div className="flex-1 mx-2 max-w-[500px]">
              <SearchBar>
              </SearchBar>
            </div>

            {/* Right Navigation - Always visible */}
            <div className="flex items-center gap-4 md:gap-5 shrink-0">
              {/* Wishlist - Always visible */}
              <Link href="/dashboard/wishlist" className="relative flex items-center justify-center">
                <Heart className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistItemsCount}
                </span>
              </Link>

              {/* Cart - Always visible */}
              <Link href="/cart" className="relative flex items-center justify-center">
                <Image src="/cart.png" alt="Shopping Cart" width={24} height={24} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              </Link>

              {/* User Menu - Always visible */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-lg h-7 px-2 flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-xs">{user.name.split(" ")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={navigateToDashboard}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-emerald-500 hover:bg-orange-900 text-white rounded-md px-4 py-2 text-lg font-medium ml-2 transition-colors h-9 min-h-0"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty space to compensate for the fixed header */}
      <div className="h-[60px]"></div>

      {/* Categories Navigation - Scrollable on mobile */}
      <div className="bg-[#004D40] text-white overflow-x-auto">
        <div className="container mx-auto px-3">
          <div className="flex items-center py-3 space-x-4 whitespace-nowrap">
            <span className="text-xs font-medium">Explore:</span>
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-xs hover:text-gray-200 transition-colors"
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
