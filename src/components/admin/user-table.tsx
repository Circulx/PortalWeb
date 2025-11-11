"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  sno: number
  name: string
  email: string
  role: string
}

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  // For pagination
  const itemsPerPage = 8
  const [currentPage, setCurrentPage] = useState(1)
  const totalUsers = users.length
  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  // Calculate visible users based on current page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers)
  const visibleUsers = users.slice(startIndex, endIndex)

  const tableRef = useRef<HTMLDivElement>(null)

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: "admin" | "seller" | "customer") => {
    try {
      setUpdating(userId)

      const response = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user role")
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
      })
    } finally {
      setUpdating(null)
    }
  }

  // Set up scroll event listener for detecting scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

      // Only update page if we've scrolled significantly
      if (scrollPercentage > 0.7 && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1)
      } else if (scrollPercentage < 0.3 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    }

    const tableElement = tableRef.current
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [currentPage, totalPages])

  // Handle pagination button clicks
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)

      // Scroll to top of table when changing pages
      if (tableRef.current) {
        tableRef.current.scrollTop = 0
      }
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)

      // Scroll to top of table when changing pages
      if (tableRef.current) {
        tableRef.current.scrollTop = 0
      }
    }
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1}-{endIndex} of {totalUsers} users
        </div>
      </div>

      <div
        ref={tableRef}
        className="w-full overflow-auto max-h-[600px] border rounded-md"
        style={{ scrollBehavior: "smooth" }}
      >
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="bg-slate-50">
              <TableHead className="w-[80px] font-medium">S.No</TableHead>
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Current Role</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Admin</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Seller</TableHead>
              <TableHead className="w-[100px] text-center font-medium">Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.sno}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={user.role === "admin"}
                      disabled={updating === user.id}
                      onCheckedChange={(checked) => {
                        if (checked) handleRoleChange(user.id, "admin")
                      }}
                      className="border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={user.role === "seller"}
                      disabled={updating === user.id}
                      onCheckedChange={(checked) => {
                        if (checked) handleRoleChange(user.id, "seller")
                      }}
                      className="border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={user.role === "customer"}
                      disabled={updating === user.id}
                      onCheckedChange={(checked) => {
                        if (checked) handleRoleChange(user.id, "customer")
                      }}
                      className="border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button onClick={goToPrevPage} disabled={currentPage === 1} variant="outline" size="sm">
          Previous
        </Button>
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="outline" size="sm">
          Next
        </Button>
      </div>
    </div>
  )
}
