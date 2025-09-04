import { connectProfileDB } from "@/lib/profileDb"
import { notFound } from "next/navigation"
import mongoose from "mongoose"
import ProductDescription from "./product-description"
import ProductActions from "./product-actions"
import ProductReviews from "./product-reviews"
import { Toaster } from "react-hot-toast"
import getReviewModel from "@/models/profile/review"
import PincodeCheck from "@/components/product/pincode-check"

// Define the product interface
interface Product {
  model: string
  _id: string
  product_id: number
  title: string
  description?: string
  price: number
  originalPrice: number
  discount?: number
  gst?: number
  stock: number
  SKU: string
  image_link?: string
  additional_images?: string[]
  category_name?: string
  seller_name?: string
  location?: string
  rating?: number
  reviewCount?: number
  units?: string
}

// Define the review interface
interface Review {
  _id: string
  userId: string
  orderId: string
  product_id: string
  title: string
  rating: number
  review: string
  status: string
  isVerifiedPurchase: boolean
  createdAt: Date
  updatedAt: Date
}

// Function to calculate the final selling price with GST and discount
const calculateFinalPrice = (basePrice: number, gst = 0, discount = 0) => {
  // Step 1: Add GST to base price
  const gstAmount = (basePrice * gst) / 100
  const priceWithGST = basePrice + gstAmount

  // Step 2: Apply discount to price with GST
  const discountAmount = (priceWithGST * discount) / 100
  const finalPrice = priceWithGST - discountAmount

  return {
    basePrice,
    gstAmount,
    priceWithGST,
    discountAmount,
    finalPrice,
  }
}

// Fetch product reviews from MongoDB PROFILE_DB
async function getProductReviews(
  productId: string,
): Promise<{ reviews: Review[]; averageRating: number; totalReviews: number }> {
  let connection
  try {
    connection = await connectProfileDB()
    console.log(`Fetching reviews for product ID: ${productId}`)

    const ReviewModel = getReviewModel(connection)

    // Fetch approved reviews for this product
    const reviews = await ReviewModel.find({
      product_id: productId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    const totalReviews = reviews.length
    let averageRating = 0

    if (totalReviews > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = Math.round((totalRating / totalReviews) * 10) / 10 // Round to 1 decimal place
    }

    console.log(`Found ${totalReviews} reviews with average rating: ${averageRating}`)

    return {
      reviews: reviews.map((review) => ({
        _id: review._id.toString(),
        userId: review.userId,
        orderId: review.orderId,
        product_id: review.product_id,
        title: review.title,
        rating: review.rating,
        review: review.review,
        status: review.status,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      averageRating,
      totalReviews,
    }
  } catch (error) {
    console.error("Error fetching product reviews:", error)
    return { reviews: [], averageRating: 0, totalReviews: 0 }
  }
}

// Fetch product data from MongoDB PROFILE_DB
async function getProductById(id: string): Promise<Product | null> {
  let connection
  try {
    connection = await connectProfileDB()
    console.log(`Connected to PROFILE_DB, fetching product with ID: ${id}`)

    const ProductModel =
      connection.models.Product ||
      connection.model(
        "Product",
        new mongoose.Schema({
          product_id: Number,
          title: String,
          description: String,
          price: Number,
          originalPrice: Number,
          discount: Number,
          gst: Number,
          stock: Number,
          SKU: String,
          image_link: String,
          additional_images: [String],
          category_name: String,
          seller_name: String,
          location: String,
          rating: Number,
          reviewCount: Number,
          units: String,
        }),
      )

    if (!ProductModel) {
      console.error("Product model not found in PROFILE_DB connection")
      return null
    }

    const productId = Number.parseInt(id, 10)
    console.log(`Searching for product with product_id: ${productId}`)

    let productDoc = null

    if (!isNaN(productId)) {
      productDoc = await ProductModel.findOne({ product_id: productId }).lean().exec()
    }

    if (!productDoc) {
      console.log(`Product not found by product_id: ${productId}, trying _id`)
      if (mongoose.Types.ObjectId.isValid(id)) {
        productDoc = await ProductModel.findById(id).lean().exec()
      }
    }

    if (!productDoc) {
      console.log(`No product found with ID: ${id}`)
      return null
    }

    const doc = Array.isArray(productDoc) ? productDoc[0] : productDoc

    if (!doc) {
      return null
    }

    const product: Product = {
      _id: doc._id ? doc._id.toString() : "",
      product_id: doc.product_id || 0,
      title: doc.title || "Untitled Product",
      description: doc.description || "",
      price: doc.price || 0,
      originalPrice: doc.originalPrice || doc.price,
      discount: doc.discount || 0,
      gst: doc.gst || 0,
      stock: doc.stock || 0,
      SKU: doc.SKU || "",
      image_link: doc.image_link,
      additional_images: doc.additional_images || [],
      category_name: doc.category_name,
      seller_name: doc.seller_name,
      location: doc.location,
      rating: doc.rating,
      reviewCount: doc.reviewCount || 0,
      units: doc.units || "units",
      model: "",
    }

    console.log(`Product found: ${product.title}`)
    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

// Product detail page component - Using a simpler approach to avoid type conflicts
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // Extract the ID parameter
    const { id } = await params

    if (!id) {
      console.error("No ID parameter provided")
      return notFound()
    }

    // Fetch the product data and reviews
    const [product, reviewData] = await Promise.all([getProductById(id), getProductReviews(id)])

    // If product not found, show 404 page
    if (!product) {
      console.log(`Product not found, returning 404`)
      return notFound()
    }

    // Calculate the final price with GST and discount
    const priceCalculation = calculateFinalPrice(product.price, product.gst, product.discount)

    // Collect all available product images
    const productImages: string[] = []

    // Add main image if available
    if (product.image_link) {
      productImages.push(product.image_link)
    }

    // Add additional images if available
    if (product.additional_images && product.additional_images.length > 0) {
      productImages.push(...product.additional_images)
    }

    // If no images are available, add a single placeholder
    if (productImages.length === 0) {
      productImages.push("/placeholder.svg?height=600&width=600")
    }

    // Default description if none provided
    const defaultDesc =
      "Kirloskar is a well-known brand which provides a highly efficient collection of water pumps which is lightweight, easy to handle, and also ups compatible. This powerful high flow rate pump is designed and manufactured to deal with large volumes. It can be used for domestic purposes in bungalows, hotels, farmhouses, etc. Also, it is widely.."

    const description = product.description || defaultDesc

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Toast container for notifications */}
        <Toaster />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image Gallery - Made sticky */}
          <div className="relative">
            <div className="sticky top-[80px] z-10">
              <div className="flex gap-4">
                {/* Thumbnails column - Only show if there are multiple images */}
                {productImages.length > 1 && (
                  <div className="hidden sm:flex flex-col gap-3 w-20">
                    {productImages.map((img, index) => (
                      <div
                        key={index}
                        className={`border ${index === 0 ? "border-blue-500" : "border-gray-200"} rounded-md overflow-hidden cursor-pointer hover:border-blue-300 transition-all`}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Main product image container with wishlist button */}
                <ProductActions
                  productId={id}
                  title={product.title}
                  price={priceCalculation.finalPrice}
                  imageUrl={product.image_link || "/placeholder.svg"}
                  discount={product.discount}
                  sellerId={product.product_id}
                  stock={product.stock}
                  units={product.units}
                  productImages={productImages}
                />
              </div>

              {/* Mobile thumbnails - Only show if there are multiple images */}
              {productImages.length > 1 && (
                <div className="sm:hidden flex gap-2 mt-4 overflow-x-auto pb-2">
                  {productImages.map((img, index) => (
                    <div
                      key={index}
                      className={`border ${index === 0 ? "border-blue-500" : "border-gray-200"} rounded-md overflow-hidden flex-shrink-0 w-20 h-20 cursor-pointer`}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Product Title */}
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>

            {/* Ratings - Now showing real data from database */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${star <= Math.floor(reviewData.averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {reviewData.averageRating > 0 ? reviewData.averageRating : 0} Ratings & {reviewData.totalReviews}{" "}
                Reviews
              </span>
            </div>

            {/* Price - Clean display without calculation breakdown */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-green-900">{priceCalculation.finalPrice.toFixed(2)}</span>
              {product.discount && product.discount > 0 && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    ₹{priceCalculation.priceWithGST.toFixed(2)}
                  </span>
                  <span className="text-lg text-green-500">{product.discount}% off</span>
                </>
              )}
            </div>

            {/* Availability */}
            <p className="text-gray-500 mb-6">
              Available: {product.stock} {product.units}
            </p>

            {/* Product Description with Read More functionality */}
            <ProductDescription description={description} />

            {/* Pincode Checker */}
            <PincodeCheck className="my-6" />

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Feature</h3>
              <ul className="grid gap-2">
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Free 1 Year Warranty</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Free Shipping & Fasted Delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>100% Money-back guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>24/7 Customer support</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Secure payment method</span>
                </li>
              </ul>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">SKU</h3>
                  <p>{product.SKU || "1112"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">CATEGORY</h3>
                  <p>{product.category_name || "Electrical Appliance"}</p>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Seller information:</h3>
              <div className="grid gap-2">
                <div className="flex">
                  <span className="font-medium w-28">Seller Name:</span>
                  <span>{product.seller_name || "AB Industrial Supplies"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-28">Location:</span>
                  <span>{product.location || "Singapore"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-28">Ratings:</span>
                  <div className="flex items-center">
                    <span className="mr-1">({reviewData.averageRating}/5</span>
                    <span className="text-sm">based on {reviewData.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <ProductReviews
          reviews={reviewData.reviews}
          averageRating={reviewData.averageRating}
          totalReviews={reviewData.totalReviews}
        />
      </div>
    )
  } catch (error) {
    console.error("Error rendering product page:", error)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
        <p className="mt-4">We're having trouble loading this product. Please try again later.</p>
      </div>
    )
  }
}
