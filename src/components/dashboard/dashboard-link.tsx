"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getCurrentUser, verifyClientToken } from "@/actions/auth"
import { clientAuth } from "@/lib/auth-client"

interface DashboardLinkProps {
  children: React.ReactNode
  className?: string
  onAuthRequired?: () => void
}

export function DashboardLink({ children, className, onAuthRequired }: DashboardLinkProps) {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    try {
      console.log("[v0] Dashboard link clicked, checking authentication...")

      let user = await getCurrentUser()

      if (!user) {
        const clientToken = clientAuth.getToken()
        if (clientToken) {
          console.log("[v0] Trying client-side token")
          user = await verifyClientToken(clientToken)
        }
      }

      console.log("[v0] User check result:", user ? `User found: ${user.type}` : "No user found")

      if (user) {
        if (user.type === "admin") {
          router.push("/admin")
        } else if (user.type === "seller") {
          router.push("/seller")
        } else {
          router.push("/dashboard")
        }
      } else {
        console.log("[v0] No user authenticated, triggering auth modal")
        if (onAuthRequired) {
          onAuthRequired()
        }
      }
    } catch (error) {
      console.error("[v0] Error checking auth:", error)
      if (onAuthRequired) {
        onAuthRequired()
      }
    }
  }

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  )
}
