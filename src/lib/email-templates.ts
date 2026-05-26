import type { Order, OrderProduct } from "@/models/profile/order"

/**
 * Generate welcome email template for new users
 */
export function generateWelcomeEmail({
  name,
  email,
}: {
  name: string
  email: string
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to IND2B - Your Marketplace Journey Begins</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc; color: #1a202c;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              <!-- Header with Gradient -->
              <tr>
                <td style="padding: 50px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to IND2B!</h1>
                  <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 300;">Your Account is Ready</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 32px;">
                  <!-- Greeting -->
                  <p style="margin: 0; font-size: 18px; line-height: 1.6; color: #2d3748;"><span style="font-weight: 600;">Hi ${name},</span></p>
                  
                  <!-- Welcome Message -->
                  <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.8; color: #4a5568;">
                    Congratulations! Your account has been successfully created. You're now part of a thriving community of buyers and sellers on IND2B. We're excited to have you on board!
                  </p>
                  
                  <!-- Features Box -->
                  <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #2d3748; text-transform: uppercase; letter-spacing: 0.5px;">What's Next?</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 16px;">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.3);">
                          <p style="margin: 0; font-size: 15px; color: #2d3748;"><strong>✓ Browse Products</strong> - Explore thousands of products from trusted sellers</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.3);">
                          <p style="margin: 0; font-size: 15px; color: #2d3748;"><strong>✓ Secure Shopping</strong> - Shop with confidence with our buyer protection program</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.3);">
                          <p style="margin: 0; font-size: 15px; color: #2d3748;"><strong>✓ Easy Checkout</strong> - Quick and secure payment options available</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <p style="margin: 0; font-size: 15px; color: #2d3748;"><strong>✓ 24/7 Support</strong> - Our support team is always ready to help</p>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse;">
                          <tr>
                            <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0;">
                              <a href="https://ind2b.com/products" style="display: inline-block; padding: 14px 32px; color: white; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">Start Shopping Now →</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Account Security Tips -->
                  <div style="margin: 32px 0; padding: 20px; background: #fef5e7; border-left: 4px solid #f39c12; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7d6608; text-transform: uppercase; letter-spacing: 0.5px;">Account Security Tips</p>
                    <ul style="margin: 12px 0 0; padding-left: 20px; font-size: 14px; color: #5a4a0a; line-height: 1.8;">
                      <li>Keep your password secure and never share it with anyone</li>
                      <li>Use a strong password with a mix of letters, numbers, and symbols</li>
                      <li>Always verify SSL certificates when shopping (look for 🔒 symbol)</li>
                      <li>Enable two-factor authentication for extra security (if available)</li>
                      <li>Report any suspicious activity to our support team immediately</li>
                    </ul>
                  </div>
                  
                  <!-- Additional Info -->
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #4a5568;">
                    Your account is all set with complete email verification. You can now enjoy full access to all IND2B features including browsing products, making purchases, and connecting with sellers.
                  </p>
                  
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #4a5568;">
                    If you have any questions or need assistance, please don't hesitate to reach out to our support team at <strong>support@ind2b.com</strong> or visit our Help Center.
                  </p>
                  
                  <!-- Closing -->
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.8; color: #4a5568;">
                    Happy shopping!<br>
                    <span style="font-weight: 600; color: #2d3748;">The IND2B Team</span>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #f7fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
                    <tr>
                      <td align="center">
                        <p style="margin: 0; font-size: 13px; color: #718096;">
                          <a href="https://ind2b.com" style="color: #667eea; text-decoration: none; margin: 0 12px;">Visit Website</a> | 
                          <a href="https://ind2b.com/about" style="color: #667eea; text-decoration: none; margin: 0 12px;">About Us</a> | 
                          <a href="https://ind2b.com/contact" style="color: #667eea; text-decoration: none; margin: 0 12px;">Contact Us</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 0; font-size: 12px; color: #a0aec0;">© ${new Date().getFullYear()} IND2B. All rights reserved.</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #a0aec0;">Account email: <span style="color: #718096;">${email}</span></p>
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

/**
 * Generate OTP email template for signup
 */
export function generateSignupOTPEmail({
  otp,
  email,
  expiresIn,
}: {
  otp: string
  email: string
  expiresIn: number
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - IND2B</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc; color: #1a202c;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome to IND2B</h1>
                  <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">Verify your email to complete signup</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 24px;">
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #2d3748;">Hi there,</p>
                  
                  <p style="margin: 16px 0 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                    Thank you for signing up with IND2B! To complete your registration and secure your account, please verify your email address using the code below.
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="margin: 32px 0; padding: 24px; background: #f7fafc; border-radius: 8px; border: 2px dashed #cbd5e0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">Your Verification Code</p>
                    <p style="margin: 12px 0 0; font-size: 40px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp
                      .split("")
                      .join(" ")}</p>
                    <p style="margin: 12px 0 0; font-size: 13px; color: #718096;">This code expires in <strong>${expiresIn} minutes</strong></p>
                  </div>
                  
                  <div style="margin: 24px 0; padding: 16px; background: #fffaf0; border-left: 4px solid #f6ad55; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #7c2d12;">
                      <strong>Security Tip:</strong> Never share this code with anyone. IND2B support staff will never ask for it.
                    </p>
                  </div>
                  
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                    Didn't sign up for an IND2B account? You can safely ignore this email. If you have questions, our support team is here to help.
                  </p>
                  
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                    Best regards,<br>
                    <span style="font-weight: 600; color: #2d3748;">The IND2B Team</span>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #f7fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 13px; color: #718096;">© ${new Date().getFullYear()} IND2B. All rights reserved.</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #a0aec0;">Sent to: <span style="color: #718096;">${email}</span></p>
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

/**
 * Generate OTP email template for login
 */
export function generateLoginOTPEmail({
  otp,
  email,
  expiresIn,
}: {
  otp: string
  email: string
  expiresIn: number
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login OTP - IND2B</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc; color: #1a202c;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 500px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 24px; background: linear-gradient(135deg, #4299e1 0%, #2d3748 100%); text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">IND2B Login</h1>
                  <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px;">Your secure login code</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 24px;">
                  <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #2d3748;">Hi,</p>
                  
                  <p style="margin: 16px 0 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                    We received a login request for your IND2B account. Use the code below to complete your login. This code is valid for the next <strong>${expiresIn} minutes</strong>.
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="margin: 32px 0; padding: 24px; background: #f7fafc; border-radius: 8px; border: 2px dashed #cbd5e0; text-align: center;">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">Your Login Code</p>
                    <p style="margin: 12px 0 0; font-size: 40px; font-weight: 700; color: #4299e1; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp
                      .split("")
                      .join(" ")}</p>
                    <p style="margin: 12px 0 0; font-size: 13px; color: #718096;">Expires in <strong>${expiresIn} minutes</strong></p>
                  </div>
                  
                  <div style="margin: 24px 0; padding: 16px; background: #fee; border-left: 4px solid #f56565; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #742a2a;">
                      <strong>Security Alert:</strong> If you didn't request this code, someone may be trying to access your account. Change your password immediately and contact support.
                    </p>
                  </div>
                  
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                    Never share this code with anyone, including IND2B staff.
                  </p>
                  
                  <p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                    Best regards,<br>
                    <span style="font-weight: 600; color: #2d3748;">The IND2B Team</span>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #f7fafc; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 13px; color: #718096;">© ${new Date().getFullYear()} IND2B. All rights reserved.</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #a0aec0;">Sent to: <span style="color: #718096;">${email}</span></p>
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
                <td style="padding: 24px; background-color: #F7FAFC; text-align: center; border-top: 1px solid #EAEAEC;">
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

/**
 * Generate a responsive HTML email template for job application confirmation
 */
export function generateApplicationConfirmationEmail(applicant: {
  fullName: string
  email: string
  careerTitle: string
  applicationId: string
  appliedAt: Date
}): string {
  const { fullName, careerTitle, applicationId, appliedAt } = applicant

  const formattedDate = appliedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Complete HTML email template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7FAFC; color: #1A202C;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Application Received!</h1>
                  <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Thank you for applying to IND2B</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 32px 24px;">
                  <p style="margin: 0; font-size: 16px;">Hi ${fullName},</p>
                  <p style="margin: 16px 0 0; font-size: 16px; line-height: 1.6;">
                    Thank you for applying for the <strong>${careerTitle}</strong> position at <strong>IND2B</strong>. 
                    We're excited to review your application!
                  </p>
                  
                  <!-- Application Details Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 24px; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td style="padding: 20px; background-color: #F7FAFC;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 14px; color: #718096; font-weight: 500;">Position Applied For</p>
                              <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #2D3748;">${careerTitle}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 14px; color: #718096; font-weight: 500;">Application ID</p>
                              <p style="margin: 4px 0 0; font-size: 14px; font-family: monospace; color: #2D3748;">${applicationId}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <p style="margin: 0; font-size: 14px; color: #718096; font-weight: 500;">Submitted On</p>
                              <p style="margin: 4px 0 0; font-size: 14px; color: #2D3748;">${formattedDate}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Next Steps -->
                  <div style="margin-top: 32px; padding: 20px; background-color: #EBF8FF; border-left: 4px solid #3182CE; border-radius: 4px;">
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #2C5282;">What Happens Next?</h2>
                    <ul style="margin: 12px 0 0; padding-left: 20px; color: #2D3748; line-height: 1.8;">
                      <li style="margin: 8px 0;">Our recruitment team will carefully review your application and qualifications</li>
                      <li style="margin: 8px 0;">We'll reach out to you within <strong>one week</strong> regarding the next steps</li>
                      <li style="margin: 8px 0;">If your profile matches our requirements, we'll schedule an interview</li>
                      <li style="margin: 8px 0;">Keep an eye on your email (including spam folder) for updates from us</li>
                    </ul>
                  </div>
                  
                  <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6;">
                    We appreciate your interest in joining our team at IND2B. We're committed to finding the best talent, 
                    and we're excited to learn more about your skills and experience.
                  </p>
                  
                  <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6;">
                    If you have any questions about your application or the hiring process, please don't hesitate to reach out to us.
                  </p>
                  
                  <p style="margin: 24px 0 0; font-size: 16px;">Best regards,</p>
                  <p style="margin: 8px 0 0; font-size: 16px; font-weight: 600;">The IND2B Recruitment Team</p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #F7FAFC; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0; font-size: 14px; color: #718096;">© ${new Date().getFullYear()} IND2B. All rights reserved.</p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #718096;">This email was sent to ${applicant.email}</p>
                  <p style="margin: 12px 0 0; font-size: 12px; color: #A0AEC0;">
                    Please do not reply directly to this email. For inquiries, contact our support team.
                  </p>
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
