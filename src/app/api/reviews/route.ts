import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/actions/auth"
import { connectProfileDB } from "@/lib/profileDb"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting review submission process...")

    // Get the current logged-in user
    const user = await getCurrentUser()
    console.log("Current user:", user ? { id: user.id, email: user.email } : "No user found")

    if (!user) {
      console.log("User not authenticated")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    console.log("Request body:", body)

    const { orderId, rating, review, orderItems } = body

    // Validate required fields
    if (!orderId) {
      console.log("Missing orderId")
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    if (!rating) {
      console.log("Missing rating")
      return NextResponse.json({ error: "Rating is required" }, { status: 400 })
    }

    if (!review) {
      console.log("Missing review")
      return NextResponse.json({ error: "Review text is required" }, { status: 400 })
    }

    // Validate rating
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      console.log("Invalid rating:", rating)
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Validate review length
    const reviewText = review.trim()
    if (reviewText.length < 10 || reviewText.length > 500) {
      console.log("Invalid review length:", reviewText.length)
      return NextResponse.json({ error: "Review must be between 10 and 500 characters" }, { status: 400 })
    }

    console.log("All validations passed, connecting to database...")

    // Connect to the database
    const connection = await connectProfileDB()
    console.log("Database connected successfully")

    // Get the Review model
    const Review = connection.models.Review
    if (!Review) {
      console.log("Review model not found in connection.models")
      return NextResponse.json({ error: "Review model not available" }, { status: 500 })
    }

    // Get the Order model to fetch order details
    const Order = connection.models.Order
    if (!Order) {
      console.log("Order model not found in connection.models")
      return NextResponse.json({ error: "Order model not available" }, { status: 500 })
    }

    console.log("Review model found, checking for existing review...")

    // Check if user has already reviewed this order
    const existingReview = await Review.findOne({
      userId: user.id,
      orderId: orderId,
    })

    if (existingReview) {
      console.log("User has already reviewed this order")
      return NextResponse.json({ error: "You have already reviewed this order" }, { status: 409 })
    }

    console.log("No existing review found, fetching order details...")

    // Fetch the actual order details to get all products
    let orderDetails = null
    try {
      // Try to find order by MongoDB ObjectId first
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        orderDetails = await Order.findById(orderId)
      }

      // If not found by ObjectId, try to find by orderId field
      if (!orderDetails) {
        orderDetails = await Order.findOne({ orderId: orderId })
      }

      // If still not found, try to find by _id as string
      if (!orderDetails) {
        orderDetails = await Order.findOne({ _id: orderId })
      }

      console.log("Order details found:", orderDetails ? "Yes" : "No")
      if (orderDetails) {
        console.log("Order products count:", orderDetails.products?.length || 0)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    }

    // Prepare order items data from the actual order
    let processedOrderItems = []

    if (orderDetails && orderDetails.products && Array.isArray(orderDetails.products)) {
      // Use products from the actual order
      processedOrderItems = orderDetails.products.map((product: any) => ({
        id: product.productId || product._id || product.id || "",
        name: product.title || product.name || "Unknown Product",
        image_link: product.image_link || product.image || "",
        price: product.price || 0,
        quantity: product.quantity || 1,
        seller_id: product.seller_id || "",
      }))
      console.log("Using order products:", processedOrderItems.length, "items")
    } else if (orderItems && Array.isArray(orderItems)) {
      // Fallback to orderItems from request if order not found
      processedOrderItems = orderItems.map((item: any) => ({
        id: item.id || item.productId || "",
        name: item.name || item.title || "Unknown Product",
        image_link: item.image_link || item.image || "",
        price: item.price || 0,
        quantity: item.quantity || 1,
        seller_id: item.seller_id || "",
      }))
      console.log("Using fallback orderItems:", processedOrderItems.length, "items")
    } else {
      console.log("No order items found, using empty array")
      processedOrderItems = []
    }

    console.log("Final processed order items:", processedOrderItems)

    // Create the review with complete order information
    const reviewData = {
      userId: user.id,
      orderId: orderId,
      rating: rating,
      review: reviewText,
      orderItems: processedOrderItems,
      status: "approved", // Changed from "pending" to "approved"
      isVerifiedPurchase: true, // Since we're fetching from actual orders
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("Creating review with data:", {
      ...reviewData,
      orderItems: `${reviewData.orderItems.length} items`,
    })

    const newReview = new Review(reviewData)
    const savedReview = await newReview.save()

    console.log("Review saved successfully:", savedReview._id)
    console.log("Saved orderItems count:", savedReview.orderItems?.length || 0)

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted and approved successfully",
        reviewId: savedReview._id.toString(),
        data: {
          id: savedReview._id.toString(),
          rating: savedReview.rating,
          review: savedReview.review,
          status: savedReview.status,
          orderItemsCount: savedReview.orderItems?.length || 0,
          createdAt: savedReview.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting review:", error)

    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        console.log("Duplicate key error - user already reviewed this order")
        return NextResponse.json({ error: "You have already reviewed this order" }, { status: 409 })
      }

      if (error.message.includes("validation")) {
        console.log("Validation error:", error.message)
        return NextResponse.json({ error: "Invalid data provided", details: error.message }, { status: 400 })
      }

      if (error.message.includes("Cast to ObjectId failed")) {
        console.log("Invalid ObjectId format")
        return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: "Failed to submit review",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "approved"

    console.log("GET reviews request:", { orderId, userId, page, limit, status })

    // Connect to the database
    const connection = await connectProfileDB()
    const Review = connection.models.Review

    if (!Review) {
      return NextResponse.json({ error: "Review model not available" }, { status: 500 })
    }

    const query: any = {}

    // Build query based on parameters
    if (status && status !== "all") {
      query.status = status
    }

    if (orderId) {
      query.orderId = orderId
    }

    if (userId) {
      if (userId === "current") {
        // Get current user for checking their reviews
        const user = await getCurrentUser()
        if (user) {
          query.userId = user.id
          // Remove status filter to show all user's reviews regardless of status
          delete query.status
        } else {
          return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
        }
      } else {
        query.userId = userId
        // Remove status filter to show all user's reviews regardless of status
        delete query.status
      }
    }

    // If no specific user is requested, only show approved reviews by default
    if (!userId && (!status || status === "approved")) {
      query.status = "approved"
    }

    console.log("Query:", query)

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ])

    console.log(`Found ${reviews.length} reviews out of ${total} total`)

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review) => ({
        ...review,
        _id: (review._id as mongoose.Types.ObjectId).toString(),
        orderItemsCount: review.orderItems?.length || 0,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
