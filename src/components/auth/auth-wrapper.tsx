"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, verifyClientToken } from "@/actions/auth"
import { AuthModal } from "./auth-modal"
import toast from "react-hot-toast"
import { clientAuth } from "@/lib/auth-client"

interface AuthWrapperProps {
  children: React.ReactNode
  requiredRole?: "admin" | "seller" | "customer"
}

export default function AuthWrapper({ children, requiredRole }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      console.log("[v0] AuthWrapper: Checking authentication for role:", requiredRole)

      try {
        let currentUser = await getCurrentUser()

        if (!currentUser) {
          const clientToken = clientAuth.getToken()
          if (clientToken) {
            console.log("[v0] AuthWrapper: Trying client-side token")
            currentUser = await verifyClientToken(clientToken)
          }
        }

        console.log(
          "[v0] AuthWrapper: getCurrentUser result:",
          currentUser ? `User: ${currentUser.email}, Type: ${currentUser.type}` : "No user",
        )

        setUser(currentUser)

        if (!currentUser) {
          console.log("[v0] AuthWrapper: No user authenticated, showing auth modal")
          setIsAuthModalOpen(true)
          setIsAuthenticated(false)
        } else if (requiredRole && currentUser.type !== requiredRole) {
          console.log("[v0] AuthWrapper: User role mismatch. Required:", requiredRole, "Actual:", currentUser.type)
          setIsAuthenticated(false)

          const portalNames = {
            admin: "Admin Portal",
            seller: "Seller Portal",
            customer: "Customer Portal",
          }
          const attemptedPortal = portalNames[requiredRole]

          toast.error(`You have not access to this ${attemptedPortal}`, {
            duration: 3000,
            position: "top-center",
            style: {
              background: "#ef4444",
              color: "#fff",
              fontWeight: "500",
            },
          })

          setTimeout(() => {
            if (currentUser.type === "admin") {
              router.push("/admin")
            } else if (currentUser.type === "seller") {
              if (currentUser.onboardingStatus === "pending") {
                router.push("/seller/light-onboarding")
              } else {
                router.push("/seller/profile")
              }
            } else {
              router.push("/dashboard")
            }
          }, 500)
        } else {
          console.log("[v0] AuthWrapper: User authenticated successfully with correct role")
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("[v0] AuthWrapper: Auth check failed with error:", error)
        setIsAuthModalOpen(true)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  const handleAuthSuccess = async () => {
    console.log("[v0] AuthWrapper: handleAuthSuccess called")
    setIsAuthModalOpen(false)
    setIsLoading(true)

    const currentUser = await getCurrentUser()
    console.log(
      "[v0] AuthWrapper: Post-login user check:",
      currentUser ? `${currentUser.email} (${currentUser.type})` : "No user",
    )

    if (currentUser) {
      if (requiredRole && currentUser.type !== requiredRole) {
        const portalNames = {
          admin: "Admin Portal",
          seller: "Seller Portal",
          customer: "Customer Portal",
        }
        const attemptedPortal = portalNames[requiredRole]

        toast.error(`You have not access to this ${attemptedPortal}`, {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#ef4444",
            color: "#fff",
            fontWeight: "500",
          },
        })

        setTimeout(() => {
          if (currentUser.type === "admin") {
            window.location.href = "/admin"
          } else if (currentUser.type === "seller") {
            if (currentUser.onboardingStatus === "pending") {
              window.location.href = "/seller/light-onboarding"
            } else {
              window.location.href = "/seller/profile"
            }
          } else {
            window.location.href = "/dashboard"
          }
        }, 500)
      } else {
        if (currentUser.type === "seller" && requiredRole === "seller") {
          if (currentUser.onboardingStatus === "pending") {
            window.location.href = "/seller/light-onboarding"
          } else {
            window.location.href = "/seller/profile"
          }
        } else {
          console.log("[v0] AuthWrapper: Reloading page for authenticated user")
          window.location.reload()
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50"></div>
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          router.push("/")
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
