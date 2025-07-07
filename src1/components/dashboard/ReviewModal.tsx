"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { toast } from "sonner"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  product: any
}

export default function ReviewModal({ isOpen, onClose, order, product }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order._id,
          productId: product.productId,
          sellerId: product.seller_id,
          rating,
          review,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Review submitted successfully!")
        onClose()
        // Reset form
        setRating(0)
        setReview("")
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4">
            <img
              src={product.image_link || "/placeholder.svg?height=60&width=60"}
              alt={product.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-sm">{product.title}</h3>
              <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Review (Optional)</label>
            <Textarea
              placeholder="Share your experience with this product..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
