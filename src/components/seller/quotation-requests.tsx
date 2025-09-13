"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquare, Phone, Mail, Calendar, IndianRupee, Loader2, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface QuotationRequest {
  _id: string
  productId: string
  productTitle: string
  customerName: string
  customerEmail: string
  customerPhone: string
  requestedPrice: number
  message?: string
  status: "pending" | "responded" | "accepted" | "rejected"
  sellerResponse?: string
  sellerQuotedPrice?: number
  createdAt: string
  updatedAt: string
}

export default function QuotationRequests() {
  const [requests, setRequests] = useState<QuotationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null)
  const [quotePrice, setQuotePrice] = useState("")
  const [quoteMessage, setQuoteMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuotationRequests()
  }, [])

  const fetchQuotationRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/seller/quotations")

      if (!response.ok) {
        throw new Error("Failed to fetch quotation requests")
      }

      const result = await response.json()
      setRequests(result.data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching quotation requests:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "responded":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSendQuote = async () => {
    if (!selectedRequest || !quotePrice) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/seller/quotations/${selectedRequest._id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotedPrice: Number(quotePrice),
          response: quoteMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send quote")
      }

      await fetchQuotationRequests()
      setSelectedRequest(null)
      setQuotePrice("")
      setQuoteMessage("")
    } catch (err) {
      console.error("Error sending quote:", err)
      alert("Failed to send quote. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleContactCustomer = (request: QuotationRequest) => {
    const subject = `Regarding your quotation request for ${request.productTitle}`
    const body = `Dear ${request.customerName},\n\nThank you for your interest in our product "${request.productTitle}".\n\nBest regards`
    const mailtoLink = `mailto:${request.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, "_blank")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading quotation requests...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={fetchQuotationRequests} className="mt-4 bg-transparent" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-600" />
          Quotation Requests
          {requests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No quotation requests yet</p>
            <p className="text-sm">Customers will be able to request quotes for your products</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{request.productTitle}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="font-medium">{request.customerName}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {request.customerEmail}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {request.customerPhone}
                    </div>
                  </div>
                  <div className="text-right md:text-left">
                    <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                      <IndianRupee className="h-5 w-5" />
                      {formatCurrency(request.requestedPrice)}
                    </div>
                    <p className="text-sm text-gray-600">Requested Price</p>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Customer Message:</p>
                    <p className="text-sm text-gray-600">{request.message}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleContactCustomer(request)}>
                    <Mail className="h-4 w-4 mr-1" />
                    Contact Customer
                  </Button>
                  {request.status === "pending" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Quote
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Send Quote Response</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Product: {request.productTitle}</p>
                            <p className="text-sm text-gray-600">Customer: {request.customerName}</p>
                            <p className="text-sm text-gray-600">
                              Requested Price: {formatCurrency(request.requestedPrice)}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Your Quoted Price (₹)</label>
                            <Input
                              type="number"
                              placeholder="Enter your quoted price"
                              value={quotePrice}
                              onChange={(e) => setQuotePrice(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Message (Optional)</label>
                            <Textarea
                              placeholder="Add any additional details or terms..."
                              value={quoteMessage}
                              onChange={(e) => setQuoteMessage(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSendQuote}
                              disabled={!quotePrice || submitting}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-1" />
                                  Send Quote
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
