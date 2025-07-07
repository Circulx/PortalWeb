import { type NextRequest, NextResponse } from "next/server"
import { connectProfileDB } from "@/lib/profileDb"
import { getCurrentUser } from "@/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, productId, sellerId, rating, review } = body

    if (!orderId || !productId || !sellerId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Connect to database
    const { connection } = await connectProfileDB()
    const ReviewModel = connection.models.Review

    if (!ReviewModel) {
      throw new Error("Review model not found")
    }

    // Check if user has already reviewed this product for this order
    const existingReview = await ReviewModel.findOne({
      userId: user.id,
      orderId: orderId,
      productId: productId,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    // Create new review
    const newReview = new ReviewModel({
      userId: user.id,
      orderId: orderId,
      productId: productId,
      sellerId: sellerId,
      rating: rating,
      review: review || "",
      userName: user.name || "Anonymous",
      userEmail: user.email || "",
      isVerifiedPurchase: true,
      status: "active",
    })

    await newReview.save()

    return NextResponse.json({
      message: "Review submitted successfully",
      reviewId: newReview._id.toString(),
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit review" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const sellerId = searchParams.get("sellerId")

    if (!productId && !sellerId) {
      return NextResponse.json({ error: "Either productId or sellerId is required" }, { status: 400 })
    }

    // Connect to database
    const { connection } = await connectProfileDB()
    const ReviewModel = connection.models.Review

    if (!ReviewModel) {
      throw new Error("Review model not found")
    }

    // Build query
    const query: any = { status: "active" }
    if (productId) query.productId = productId
    if (sellerId) query.sellerId = sellerId

    // Find reviews
    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).limit(100).lean()

    // Serialize reviews
    const serializedReviews = reviews.map((review: any) => ({
      ...review,
      _id: review._id.toString(),
      createdAt: review.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: review.updatedAt?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json(serializedReviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reviews" },
      { status: 500 },
    )
  }
}
