"\"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, ShoppingBag, Star, Store, PackageOpen } from "lucide-react"






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
    href: "/admin/order-manager",
    title: "Order Manager",
    icon: PackageOpen,
  },
  {
    href: "/admin/reviews",
    title: "Reviews",
    icon: Star,
  },
  {
    href: "/admin/sellers",
    title: "Sellers",
    icon: Store,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="py-4 px-2">
        <h2 className="text-lg font-semibold tracking-tight mb-2 px-4">Admin Dashboard</h2>
        <div className="space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-muted font-medium text-primary",
                pathname === link.href ? "bg-muted font-medium text-primary" : "text-muted-foreground",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
