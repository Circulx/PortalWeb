"use client"

import { useRef } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  Package2,
  ClipboardList,
  Star,
  UserCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navItems = [
    { href: "/seller/dashboard?view=dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/products", icon: Package2, label: "Product Management" },
    { href: "/seller/orders", icon: ClipboardList, label: "Order Management" },
    { href: "/seller/quotations", icon: MessageSquare, label: "Quotation Requests" },
    { href: "/seller/reviews", icon: Star, label: "Ratings & Reviews" },
    { href: "/seller/profile", icon: UserCircle, label: "Profile Management" },
    { href: "/seller/help", icon: HelpCircle, label: "Help/Support" },
  ]

  // Check if the current path matches the nav item's href
  const isActive = (path: string) => {
    if (path.includes("?")) {
      // For paths with query parameters (like /seller/dashboard?view=dashboard)
      const [basePath, queryString] = path.split("?")
      const query = new URLSearchParams(queryString)
      const view = query.get("view")

      return pathname === basePath && searchParams.get("view") === view
    }

    // For regular paths
    return pathname === path
  }

  // Close sidebar only on mobile when a link is clicked, keep open on desktop
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          w-64 bg-white border-r border-gray-200 flex-shrink-0
          fixed inset-y-0 left-0 pt-20
          md:fixed md:left-0 md:top-0 md:pt-20 md:max-h-[calc(100vh-80px)] md:z-30 md:overflow-y-auto
          ${isMobileMenuOpen ? "z-40 translate-x-0" : "-translate-x-full md:translate-x-0"} 
          transition-transform duration-300 ease-in-out overflow-y-auto shadow-lg md:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-bold text-green-900">Seller Portal</h1>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4 pt-4 pb-8">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    active 
                      ? "bg-green-900 text-white shadow-sm" 
                      : "text-gray-700 hover:bg-green-100 hover:text-green-900",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}
