import type { Order, OrderProduct } from "@/models/profile/order"

/**
 * Generate a responsive HTML email template for order confirmation
 */
export function generateOrderConfirmationEmail(order: Order): string {
  const {
    _id,
    products,
    totalAmount,
    subTotal,
    discount = 0,
    tax = 0,
    status,
    billingDetails,
    createdAt,
    paymentMethod,
  } = order

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

  // Format currency
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

  // Generate product rows
  const productRows = products
    .map(
      (product: OrderProduct) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EAEAEC;">
        <div style="display: flex; align-items: center;">
          ${product.image_link ? `<img src="${product.image_link}" alt="${product.title}" style="width: 64px; height: 64px; object-fit: cover; margin-right: 12px; border-radius: 4px;">` : ""}
          <div>
            <p style="margin: 0; font-weight: 500;">${product.title}</p>
            <p style="margin: 4px 0 0; color: #666;">Qty: ${product.quantity}</p>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #EAEAEC; text-align: right; vertical-align: top;">
        ${formatCurrency(product.price)}
      </td>
    </tr>
  `,
    )
    .join("")

  // Generate shipping address
  const shippingAddress = billingDetails
    ? `
    <p style="margin: 0;">${billingDetails.firstName} ${billingDetails.lastName}</p>
    <p style="margin: 4px 0 0;">${billingDetails.address}</p>
    <p style="margin: 4px 0 0;">${billingDetails.city}, ${billingDetails.state} ${billingDetails.zipCode}</p>
    <p style="margin: 4px 0 0;">${billingDetails.country}</p>
    <p style="margin: 4px 0 0;">${billingDetails.phone}</p>
  `
    : "<p>No shipping address provided</p>"

  // Generate status badge
  const getStatusBadge = (orderStatus: string) => {
    const statusLower = orderStatus.toLowerCase()
    let color = "#718096" // Default gray

    if (statusLower.includes("delivered")) {
      color = "#48BB78" // Green
    } else if (statusLower.includes("shipped")) {
      color = "#4299E1" // Blue
    } else if (statusLower.includes("processing") || statusLower.includes("pending")) {
      color = "#ECC94B" // Yellow
    } else if (statusLower.includes("cancelled")) {
      color = "#F56565" // Red
    }

    return `<span style="display: inline-block; padding: 4px 8px; background-color: ${color}; color: white; border-radius: 4px; font-size: 12px; font-weight: 500;">${orderStatus}</span>`
  }

  // Complete HTML email template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7FAFC; color: #1A202C;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
              <!-- Header -->
              <tr>
                <td style="padding: 24px; background-color: #1A202C; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Order Confirmation</h1>
                </td>
              </tr>
              
              <!-- Order Info -->
              <tr>
                <td style="padding: 24px;">
                  <p style="margin: 0; font-size: 16px;">Hi ${billingDetails?.firstName || "there"},</p>
                  <p style="margin: 16px 0 0;">Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px; border: 1px solid #EAEAEC; border-radius: 4px; overflow: hidden;">
                    <tr>
                      <td style="padding: 16px; background-color: #F9FAFB; border-bottom: 1px solid #EAEAEC;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td>
                              <p style="margin: 0; font-weight: 600; font-size: 14px;">ORDER #${_id}</p>
                              <p style="margin: 4px 0 0; color: #666; font-size: 14px;">Placed on ${formattedDate}</p>
                            </td>
                            <td align="right">
                              ${getStatusBadge(status || "PENDING")}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Products -->
                    <tr>
                      <td>
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #EAEAEC; font-weight: 500; color: #666;">Product</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 1px solid #EAEAEC; font-weight: 500; color: #666;">Price</th>
                          </tr>
                          ${productRows}
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Order Summary -->
                    <tr>
                      <td>
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #F9FAFB;">
                          <tr>
                            <td style="padding: 12px; border-top: 1px solid #EAEAEC;">
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td style="padding: 4px 0;">Subtotal</td>
                                  <td style="padding: 4px 0; text-align: right;">${formatCurrency(subTotal)}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 4px 0;">Shipping</td>
                                  <td style="padding: 4px 0; text-align: right;">₹0.00</td>
                                </tr>
                                <tr>
                                  <td style="padding: 4px 0;">Tax</td>
                                  <td style="padding: 4px 0; text-align: right;">${formatCurrency(tax)}</td>
                                </tr>
                                ${
                                  discount > 0
                                    ? `
                                <tr>
                                  <td style="padding: 4px 0;">Discount</td>
                                  <td style="padding: 4px 0; text-align: right;">-${formatCurrency(discount)}</td>
                                </tr>
                                `
                                    : ""
                                }
                                <tr>
                                  <td style="padding: 8px 0; font-weight: 600;">Total</td>
                                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatCurrency(totalAmount)}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Shipping & Payment Info -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px;">
                    <tr>
                      <td style="width: 50%; padding-right: 12px; vertical-align: top;">
                        <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Shipping Address</h2>
                        ${shippingAddress}
                      </td>
                      <td style="width: 50%; padding-left: 12px; vertical-align: top;">
                        <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600;">Payment Method</h2>
                        <p style="margin: 0;">${paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 0;">If you have any questions or concerns about your order, please contact our customer support team.</p>
                  
                  <p style="margin: 24px 0 0;">Thank you for shopping with us!</p>
                  
                  <p style="margin: 16px 0 0;">Best regards,<br>The Team</p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #F9FAFB; text-align: center; border-top: 1px solid #EAEAEC;">
                  <p style="margin: 0; font-size: 14px; color: #666;">© 2024 Your Company. All rights reserved.</p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #666;">This email was sent to ${billingDetails?.email || "you"}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
