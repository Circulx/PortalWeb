"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Download, X } from "lucide-react"
import Image from "next/image"
import type { Order } from "./OrdersPage" // Import the types from OrdersPage
import jsPDF from "jspdf"

interface InvoiceModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Handle download as PDF using jsPDF directly
  const handleDownload = async () => {
    if (!order) return

    setIsDownloading(true)

    try {
      // Create new PDF document
      const pdf = new jsPDF()

      // Add invoice header
      const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`
      const invoiceDate = new Date(order.date)

      // Set font styles
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(20)
      pdf.text("INVOICE", 20, 20)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(12)
      pdf.text(`#${invoiceNumber}`, 20, 28)

      // Company info
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text("Your E-Commerce Store", 150, 20, { align: "right" })
      pdf.text("support@yourstore.com", 150, 26, { align: "right" })

      // Customer info
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.text("BILL TO", 20, 45)

      pdf.setFont("helvetica", "normal")
      if (order.shippingDetails) {
        pdf.text(`${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`, 20, 52)
        pdf.text(order.shippingDetails.email, 20, 58)
        pdf.text(order.shippingDetails.address, 20, 64)
        pdf.text(
          `${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zipCode}`,
          20,
          70,
        )
        pdf.text(order.shippingDetails.country, 20, 76)
      }

      // Invoice details
      pdf.setFont("helvetica", "bold")
      pdf.text("INVOICE DATE", 150, 45, { align: "right" })
      pdf.setFont("helvetica", "normal")
      pdf.text(format(invoiceDate, "MMMM d, yyyy"), 150, 52, { align: "right" })

      pdf.setFont("helvetica", "bold")
      pdf.text("STATUS", 150, 65, { align: "right" })
      pdf.setFont("helvetica", "normal")
      pdf.text("Paid", 150, 72, { align: "right" })

      // Items table - manually create a simple table
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.text("Item", 20, 90)
      pdf.text("Price", 100, 90)
      pdf.text("Qty", 130, 90)
      pdf.text("Total", 160, 90)

      // Draw a line under the header
      pdf.line(20, 92, 190, 92)

      // Add items
      pdf.setFont("helvetica", "normal")
      let yPos = 100

      order.items.forEach((item, index) => {
        // Item name
        pdf.text(item.name.substring(0, 40) + (item.name.length > 40 ? "..." : ""), 20, yPos)

        // Price
        pdf.text(`₹${item.price.toFixed(2)}`, 100, yPos)

        // Quantity
        pdf.text(item.quantity.toString(), 130, yPos)

        // Total
        pdf.text(`₹${(item.price * item.quantity).toFixed(2)}`, 160, yPos)

        yPos += 10

        // Add a light gray line between items
        if (index < order.items.length - 1) {
          pdf.setDrawColor(200, 200, 200)
          pdf.line(20, yPos - 5, 190, yPos - 5)
        }
      })

      // Draw a line after the items
      pdf.setDrawColor(0, 0, 0)
      pdf.line(20, yPos, 190, yPos)
      yPos += 10

      // Summary
      pdf.text("Subtotal:", 120, yPos + 10)
      pdf.text(`₹${order.subtotal.toFixed(2)}`, 170, yPos + 10, { align: "right" })

      pdf.text("Tax:", 120, yPos + 18)
      pdf.text(`₹${order.tax.toFixed(2)}`, 170, yPos + 18, { align: "right" })

      pdf.text("Shipping:", 120, yPos + 26)
      pdf.text("₹0.00", 170, yPos + 26, { align: "right" })

      // Draw a line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(120, yPos + 30, 170, yPos + 30)

      // Total
      pdf.setFont("helvetica", "bold")
      pdf.text("Total:", 120, yPos + 38)
      pdf.text(`₹${(order.subtotal + order.tax).toFixed(2)}`, 170, yPos + 38, { align: "right" })

      // Payment information
      pdf.setFont("helvetica", "bold")
      pdf.text("PAYMENT INFORMATION", 20, yPos + 55)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Method: ${order.paymentMethod}`, 20, yPos + 63)
      pdf.text(`Order ID: ${order.id}`, 20, yPos + 71)
      pdf.text(`Date: ${format(invoiceDate, "MMMM d, yyyy")}`, 20, yPos + 79)

      // Notes
      pdf.setFont("helvetica", "bold")
      pdf.text("NOTES", 20, yPos + 95)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(9)
      const noteText =
        "Thank you for your business! If you have any questions about this invoice, please contact our customer support team at support@yourstore.com."

      // Split the note text into multiple lines if needed
      const splitText = pdf.splitTextToSize(noteText, 170)
      pdf.text(splitText, 20, yPos + 103)

      // Footer
      pdf.setFontSize(8)
      pdf.text("This is a computer-generated invoice and does not require a signature.", 105, 280, { align: "center" })
      pdf.text(`© ${new Date().getFullYear()} Your E-Commerce Store. All rights reserved.`, 105, 285, {
        align: "center",
      })

      // Save the PDF
      pdf.save(`${invoiceNumber}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (!order) return null

  const invoiceDate = new Date(order.date)
  const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`
  const dueDate = new Date(invoiceDate)
  dueDate.setDate(dueDate.getDate() + 15) // Due date is 15 days after invoice date

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Invoice #{invoiceNumber}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-6" ref={invoiceRef} id="invoice-content">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">INVOICE</h1>
              <p className="text-gray-600 mt-1">#{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="h-12 w-auto relative">
                <Image src="/" alt="Company Logo" width={150} height={48} className="object-contain" />
              </div>
              <p className="text-sm text-gray-600 mt-2">IND2B</p>
              <p className="text-sm text-gray-600">product.circ@i10ai.com</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
              {order.shippingDetails && (
                <div className="text-sm">
                  <p className="font-medium">
                    {order.shippingDetails.firstName} {order.shippingDetails.lastName}
                  </p>
                  <p>{order.shippingDetails.email}</p>
                  <p>{order.shippingDetails.address}</p>
                  <p>
                    {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}
                  </p>
                  <p>{order.shippingDetails.country}</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">INVOICE DATE</h3>
                <p className="text-sm">{format(invoiceDate, "MMMM d, yyyy")}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">DUE DATE</h3>
                <p className="text-sm">{format(dueDate, "MMMM d, yyyy")}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1">STATUS</h3>
                <p className="text-sm font-medium text-green-600">Paid</p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <div className="bg-gray-100 rounded-t-md p-3 grid grid-cols-12 gap-2 text-sm font-medium text-gray-600">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="border-x border-b rounded-b-md overflow-hidden">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-2 p-3 text-sm ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                      <Image
                        src={item.image_link || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="col-span-2 text-right">₹{item.price.toFixed(2)}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-medium">₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium">₹0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-2">
                <span className="font-medium">Total</span>
                <span className="font-bold text-emerald-900">₹{(order.subtotal + order.tax).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">PAYMENT INFORMATION</h3>
            <div className="text-sm">
              <p>
                <span className="font-medium">Method:</span> {order.paymentMethod}
              </p>
              <p>
                <span className="font-medium">Order ID:</span> {order.id}
              </p>
              <p>
                <span className="font-medium">Date:</span> {format(invoiceDate, "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES</h3>
            <p className="text-sm text-gray-600">
              Thank you for your business! If you have any questions about this invoice, please contact our customer
              support team at product.circ@i10ai.com.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-12">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p className="mt-1">© {new Date().getFullYear()} IND2B. All rights reserved.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-1 bg-emerald-900 hover:bg-emerald-800"
          >
            {isDownloading ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Invoice
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
