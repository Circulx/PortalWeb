import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatsCard } from "@/components/seller/reviews/stats-card"
import { RatingDistribution } from "@/components/seller/reviews/rating-distribution"
import { ReviewItem } from "@/components/seller/reviews/review-item"
import { ProductDetails } from "@/components/seller/reviews/product-details"
import type { /*Review*/ RatingStats, ProductDetails as IProductDetails, ProductMetrics } from "@/types/review"
import { Card, CardContent } from "@/components/ui/card"

const ratingStats: RatingStats = {
  total: 10000,
  average: 4.5,
  growth: 8.5,
  distribution: [75, 15, 5, 3, 2],
}

const productDetails: IProductDetails = {
  name: "Aluminum Sheets",
  sku: "AL123",
  category: "Metal",
  pricePerUnit: 250,
  availableStock: 150,
  description:
    "Aluminum sheet compound is a lightweight, durable, and corrosion-resistant sheet compound. Used in a variety of applications. Known for its excellent strength-to-weight ratio, aluminum is ideal for applications in aerospace, automotive, construction, packaging, and electronics. In today's industrial world, it can be formed into different formats such as sheets, foils, and extrusions. Aluminum is also 100% recyclable, offering an environmentally-friendly option for sustainable manufacturing.",
  imageUrl: "/image.webp",
}

const productMetrics: ProductMetrics = {
  totalSales: {
    value: 500,
    growth: 2.5,
  },
  revenue: {
    value: 25000,
    growth: -4.5,
  },
  conversionRate: {
    value: 15,
    growth: 2.5,
  },
  totalViews: {
    value: 2700,
    growth: 2.9,
  },
  averageReview: {
    value: 4.5,
    distribution: [75, 15, 5, 3, 2],
  },
}

// const reviews: Review[] = [
//   {
//     id: "1",
//     productName: "Aluminum Sheets",
//     sku: "AL123",
//     company: "XYZ Industries",
//     rating: 2.5,
//     text: "A type of fake review specifically designed to spread false information about a product or service. Disinformation reviews are often coordinated campaigns aimed at misleading consumers by presenting fabricated or manipulated facts.",
//     date: "24th Dec 2023",
//     imageUrl: "/image.webp",
//   },
//   {
//     id: "2",
//     productName: "Aluminum Sheets",
//     sku: "AL123",
//     company: "XYZ Industries",
//     rating: 4.5,
//     text: "A type of fake review specifically designed to spread false information about a product or service. Disinformation reviews are often coordinated campaigns aimed at misleading consumers by presenting fabricated or manipulated facts.",
//     date: "14th Dec 2022",
//     imageUrl: "/image.webp",
//   },
//   {
//     id: "3",
//     productName: "Aluminum Sheets",
//     sku: "AL123",
//     company: "XYZ Industries",
//     rating: 4.5,
//     text: "A type of fake review specifically designed to spread false information about a product or service. Disinformation reviews are often coordinated campaigns aimed at misleading consumers by presenting fabricated or manipulated facts.",
//     date: "24th Dec 2023",
//     imageUrl: "/image.webp",
//   },
// ]

export default function RatingAndReview() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Rating and Review Section */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-semibold">Rating and Review</h1>
            <Select defaultValue="march-dec">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="march-dec">March 22-Dec 24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              title="Total Review"
              value={`${(ratingStats.total / 1000).toFixed(1)}K`}
              subtitle="Growth in reviews"
              growth={ratingStats.growth}
            />
            <StatsCard
              title="Average Review"
              value={ratingStats.average}
              subtitle="Average rating of this year"
              showStars={true}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-4 sm:p-6">
                  <RatingDistribution distribution={ratingStats.distribution} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* <div className="bg-card rounded-lg border divide-y">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div> */}
        </div>

        {/* Product Analysis Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <h1 className="text-xl sm:text-2xl font-semibold">Product Analysis</h1>
            <Select defaultValue="march-dec">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="march-dec">March 22-Dec 24</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ProductDetails product={productDetails} />

          <div>
            <h2 className="text-xl font-semibold mb-4">Product Key Metrics Summary</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard
                title="Total Sales"
                value={productMetrics.totalSales.value}
                subtitle="Total units sold"
                growth={productMetrics.totalSales.growth}
              />
              <StatsCard
                title="Revenue Generated"
                value={`$${productMetrics.revenue.value.toLocaleString()}`}
                subtitle="Revenue from product"
                growth={productMetrics.revenue.growth}
              />
              <StatsCard
                title="Conversion Rate"
                value={`${productMetrics.conversionRate.value}%`}
                subtitle="% of views resulted in purchase"
                growth={productMetrics.conversionRate.growth}
              />
              <StatsCard
                title="Total Views"
                value={`${(productMetrics.totalViews.value / 1000).toFixed(1)}K`}
                subtitle="No. of views"
                growth={productMetrics.totalViews.growth}
              />
              <div className="sm:col-span-2 lg:col-span-2">
                <StatsCard
                  title="Average Review"
                  value={productMetrics.averageReview.value}
                  subtitle="Average rating of this year"
                  showStars={true}
                >
                  <div className="mt-4">
                    <RatingDistribution distribution={productMetrics.averageReview.distribution} />
                  </div>
                </StatsCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
