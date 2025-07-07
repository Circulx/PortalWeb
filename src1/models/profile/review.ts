export interface Review {
  id: string
  userId: string
  orderId: string
  productId: string
  rating: number
  reviewTitle?: string
  reviewText: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ReviewWithProduct extends Review {
  productName: string
  productImage?: string
  userName: string
}

export interface ProductReviewSummary {
  productId: string
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}
