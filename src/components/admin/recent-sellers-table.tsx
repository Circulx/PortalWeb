import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Seller {
  id: string
  name: string
  email: string
  registeredDate: string
}

const recentSellers: Seller[] = [
  {
    id: "647",
    name: "Wade Warren",
    email: "aha.example.com",
    registeredDate: "Oct. 16, 1995",
  },
  {
    id: "883",
    name: "Esther Howard",
    email: "deepak.firm.com",
    registeredDate: "Sep. 24, 1985",
  },
  {
    id: "884",
    name: "Jane Cooper",
    email: "jane.cooper@example.com",
    registeredDate: "Jan. 15, 2000",
  },
  {
    id: "885",
    name: "Robert Fox",
    email: "robert.fox@example.com",
    registeredDate: "Mar. 30, 1998",
  },
]

export function RecentSellersTable() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 font-semibold">Recently Added Sellers</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Seller Name</th>
              <th className="px-4 py-3 hidden sm:table-cell">Email ID</th>
              <th className="px-4 py-3 hidden md:table-cell">Registered Date</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {recentSellers.map((seller, index) => (
              <tr key={index} className="border-t bg-white hover:bg-gray-50">
                <td className="px-4 py-3">{seller.id}</td>
                <td className="px-4 py-3">{seller.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell">{seller.email}</td>
                <td className="px-4 py-3 hidden md:table-cell">{seller.registeredDate}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="destructive" size="icon" className="h-7 w-7">
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      className="h-7 w-7 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
