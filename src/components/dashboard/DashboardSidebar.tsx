"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { User, MapPin, ShoppingCart, Heart, ClipboardList, Lock } from "lucide-react"

const navigation = [
  { name: "My Account", href: "/dashboard", icon: User },
  { name: "Address", href: "/dashboard/address", icon: MapPin },
  { name: "My Cart", href: "/dashboard/cart", icon: ShoppingCart },
  { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { name: "Order History", href: "/dashboard/orders", icon: ClipboardList },
  { name: "Change Password", href: "/dashboard/password", icon: Lock },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-r md:border-b-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-emerald-900">My Profile</h1>
      </div>
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "bg-emerald-900 text-white" : "text-gray-600 hover:bg-orange-500 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
