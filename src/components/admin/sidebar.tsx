"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Star,
  Store,
  PackageOpen,
  ImageIcon,
  MessageSquare,
  X,
  MessageCircle,
  BarChart3,
} from "lucide-react"

const sidebarLinks = [
  {
    href: "/admin",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    title: "Users",
    icon: Users,
  },
  {
    href: "/admin/order-manager",
    title: "Order Manager",
    icon: PackageOpen,
  },
  {
    href: "/admin/reviews",
    title: "Product Reviews",
    icon: Star,
  },
  {
    href: "/admin/customer-reviews",
    title: "Customer Reviews",
    icon: MessageSquare,
  },
  {
    href: "/admin/customer-query",
    title: "Customer Query",
    icon: MessageSquare,
  },
  {
    href: "/admin/sellers",
    title: "Sellers",
    icon: Store,
  },
  {
    href: "/admin/advertisements",
    title: "Advertisements",
    icon: ImageIcon,
  },
  {
    href: "/admin/whatsapp/campaigns",
    title: "WhatsApp Campaigns",
    icon: MessageCircle,
  },
  {
    href: "/admin/whatsapp/analytics",
    title: "WhatsApp Analytics",
    icon: BarChart3,
  },
  {
    title: "Customer Feedbacks",
    href: "/admin/feedbacks",
    icon: MessageSquare,
    description: "View and manage customer feedback",
  },
]

interface SidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
        w-80 md:w-64 bg-white border-r flex-shrink-0
        md:relative md:translate-x-0 md:block
        ${isMobileMenuOpen ? "fixed top-0 left-0 h-full z-50 transform translate-x-0" : "hidden md:block"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="sticky top-0 h-screen flex flex-col">
          <div className="flex items-center justify-between py-6 px-4 border-b">
            <h2 className="text-xl font-bold tracking-tight">Admin Dashboard</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="py-4 px-2 flex-1">
            <div className="space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 font-medium",
                    pathname === link.href ? "bg-gray-100 text-gray-900" : "text-gray-600",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
