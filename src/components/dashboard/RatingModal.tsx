"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderItems: Array<{
    id: string
    name: string
    image_link?: string
  }>
}

export function RatingModal({ isOpen, onClose, orderId, orderItems }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    if (review.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write at least 10 characters for your review",
        variant: "destructive",
      })
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
          orderId,
          rating,
          review: review.trim(),
          orderItems,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review has been submitted for moderation.",
      })

      // Reset form and close modal
      setRating(0)
      setHoveredRating(0)
      setReview("")
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setHoveredRating(0)
      setReview("")
      onClose()
    }
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor"
      case 2:
        return "Fair"
      case 3:
        return "Good"
      case 4:
        return "Very Good"
      case 5:
        return "Excellent"
      default:
        return "Select a rating"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 border-b">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Rate Your Order</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Items in this order:</h3>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_link || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">How would you rate your experience?</h3>
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600">{getRatingText(hoveredRating || rating)}</p>
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Write your review</h3>
            <div className="relative">
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this order. What did you like or dislike?"
                className="min-h-[100px] resize-none pr-16"
                maxLength={500}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">{review.length}/500</div>
            </div>
            {review.length > 0 && review.length < 10 && (
              <p className="text-xs text-red-500">Please write at least 10 characters</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 px-4 sm:px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || review.trim().length < 10}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Submitting...
              </div>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
