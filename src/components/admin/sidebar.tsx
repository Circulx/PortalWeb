"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, ShoppingBag, Star, Store, PackageOpen, ImageIcon } from "lucide-react"

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
    href: "/admin/order",
    title: "Orders",
    icon: ShoppingBag,
  },
  
  {
    href: "/admin/reviews",
    title: "Product review",
    icon: Star,
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
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="py-6 px-4 border-b">
        <h2 className="text-xl font-bold tracking-tight">Admin Dashboard</h2>
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
            >
              <link.icon className="h-5 w-5" />
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
