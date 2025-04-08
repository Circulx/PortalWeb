export interface ReviewStats {
  total: number
  pending: number
  approved: number
  flagged: number
  totalGrowth: number
  pendingGrowth: number
  approvedGrowth: number
  flaggedGrowth: number
}

export interface Review {
  id: string
  image: string
  buyerName: string
  review: string
  date: string // ISO date string
  productName: string
  sellerName: string
  status: "Pending" | "Approved" | "Flagged"
}

export interface Product {
  _id: string
  product_id: number
  title: string
  image_link?: string
  seller_name: string
  status?: "Pending" | "Approved" | "Flagged"
  created_at?: string
}

