"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Mail, ShoppingBag, Menu, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AuthModal } from "../auth/auth-modal"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "@/actions/auth"
import Searchbar from "@/components/layout/searchbar"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const cartItemsCount = useSelector((state: RootState) => state.cart.items.length)

  const categories = [
    "Storage Tanks, Drums",
    "Oils, Grease & Lubricants",
    "Heater, Thermostat",
    "Wire Mesh & Gratings",
    "Containers",
    "Papers",
  ]

  function handleAuthSuccess() {
    setIsAuthModalOpen(false)
    // Refresh the page to update the user state
    window.location.reload()
  }

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Top Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-auto">
            <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Circulx</span>
          </Link>

          {/* Search Bar */}
          <Searchbar />

          {/* Right Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            <button className="relative hidden sm:block">
              <Mail className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <Link href="/cart">
              <button className="relative">
                <Image src="/cart.png" alt="Shopping Cart" width={24} height={24} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              </button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full h-10 px-4 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={user.type === "admin" ? "/admin" : user.type === "seller" ? "/seller" : "/dashboard"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} className="hidden sm:block px-6 py-2 rounded-full">
                Sign In
              </Button>
            )}
            <button className="sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mt-4 sm:hidden">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-gray-300"
                />
              </div>
              {!user && (
                <Button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2 rounded-full w-full">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Categories Navigation */}
      <div className="bg-[#004D40] text-white overflow-x-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-3 space-x-4 sm:space-x-8">
            <span className="text-sm whitespace-nowrap">Explore:</span>
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-sm whitespace-nowrap hover:text-gray-200 transition-colors"
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

