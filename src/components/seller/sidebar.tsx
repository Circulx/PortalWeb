"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { LayoutDashboard, Package2, ClipboardList, Star, UserCircle, HelpCircle, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const toggleSidebar = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    { href: "/seller?view=dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/seller/products", icon: Package2, label: "Product Management" },
    { href: "/seller/orders", icon: ClipboardList, label: "Order Management" },
    { href: "/seller/reviews", icon: Star, label: "Ratings & Reviews" },
    { href: "/seller/profile", icon: UserCircle, label: "Profile Management" },
    { href: "/seller/help", icon: HelpCircle, label: "Help/Support" },
  ]

  return (
    <div className="relative h-full">
      {/* Toggle button moved inside the main container and hidden when sidebar is open */}
      <Button
        variant="ghost"
        size="icon"
        className={`md:hidden absolute top-4 left-4 z-30 ${isOpen ? "invisible" : "visible"}`}
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-40 w-64 
          bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-900">Seller Portal</h1>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-1">
            {navItems.map((item) => {
              // Special handling for Dashboard to check if it's active
              const isDashboardActive =
                item.href.includes("dashboard") && pathname === "/seller" && searchParams.get("view") === "dashboard"

              // Special handling for Profile Management to check if it's active
              const isProfileActive =
                item.href === "/seller/profile" || (pathname === "/seller" && !searchParams.get("view"))

              // For other items, check if pathname matches
              const isActive = item.href.includes("dashboard")
                ? isDashboardActive
                : item.href === "/seller/profile"
                  ? isProfileActive
                  : pathname === item.href

              return (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={<item.icon className="h-5 w-5" />}
                  label={item.label}
                  isActive={isActive}
                />
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function SidebarLink({ href, icon, label, isActive }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 rounded-md px-3 py-2 mb-1
        text-sm font-medium transition-colors duration-200
        ${isActive ? "bg-green-900 text-white" : "text-black hover:bg-green-900"}
      `}
    >
      {icon}
      {label}
    </Link>
  )
}

