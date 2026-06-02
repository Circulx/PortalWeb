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
  const year = new Date().getFullYear()
  const firstName = name.split(" ")[0]
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to IND2B</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0fdf9;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,197,169,0.10),0 1px 4px rgba(0,0,0,0.06);">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#149882 0%,#1ac5a9 55%,#13ebc7 100%);padding:48px 32px 40px;text-align:center;">
              <!-- Logo mark -->
              <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.18);border-radius:14px;margin-bottom:20px;line-height:56px;font-size:28px;"><img src="https://ind2b.com/logo1.webp" alt="IND2B" width="140" height="auto"
  style="filter:brightness(0) invert(1);" /></div>
              <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">Welcome to IND2B!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.92);font-size:16px;font-weight:400;">Your marketplace journey starts now</p>
            </td>
          </tr>

          <!-- Greeting strip -->
          <tr>
            <td style="padding:32px 36px 0;">
              <p style="margin:0;font-size:20px;font-weight:600;color:#0f2027;">Hey ${firstName}! 👋</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.75;color:#4a5568;">
                Congratulations — your IND2B account is live and ready to go. You're now part of a growing community of buyers and sellers across India. We're thrilled to have you with us!
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:28px 36px 0;"><div style="height:1px;background:linear-gradient(90deg,transparent,#d0f5ee,transparent);"></div></td></tr>

          <!-- Feature cards row -->
          <tr>
            <td style="padding:28px 36px 0;">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#1ac5a9;text-transform:uppercase;letter-spacing:1.2px;">What you can do</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:0 6px 12px 0;width:50%;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0fdf9;border-radius:10px;border:1px solid #c6f5ed;">
                      <tr><td style="padding:16px;">
                        <div style="font-size:22px;margin-bottom:8px;">🔍</div>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#0f2027;">Browse Products</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Explore thousands of products from verified sellers</p>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 0 12px 6px;width:50%;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0fdf9;border-radius:10px;border:1px solid #c6f5ed;">
                      <tr><td style="padding:16px;">
                        <div style="font-size:22px;margin-bottom:8px;">🛡️</div>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#0f2027;">Buyer Protection</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Shop with confidence — every purchase is protected</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 6px 0 0;width:50%;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0fdf9;border-radius:10px;border:1px solid #c6f5ed;">
                      <tr><td style="padding:16px;">
                        <div style="font-size:22px;margin-bottom:8px;">⚡</div>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#0f2027;">Fast Checkout</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Quick, secure payments — UPI, cards & more</p>
                      </td></tr>
                    </table>
                  </td>
                  <td style="padding:0 0 0 6px;width:50%;vertical-align:top;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0fdf9;border-radius:10px;border:1px solid #c6f5ed;">
                      <tr><td style="padding:16px;">
                        <div style="font-size:22px;margin-bottom:8px;">💬</div>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#0f2027;">24/7 Support</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Our team is always here when you need help</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:32px 36px;" align="center">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#149882,#1ac5a9);">
                    <a href="https://ind2b.com/products" style="display:inline-block;padding:15px 40px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px;border-radius:10px;">Start Shopping Now &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security tips -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.8px;">🔒 Keep your account safe</p>
                    <ul style="margin:10px 0 0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.9;">
                      <li>Never share your password or OTP with anyone, including IND2B staff</li>
                      <li>Use a strong password with letters, numbers &amp; special characters</li>
                      <li>Look for the 🔒 padlock in your browser before entering any details</li>
                      <li>Report suspicious activity immediately to <strong>support@ind2b.com</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 36px 32px;">
              <p style="margin:0;font-size:15px;line-height:1.7;color:#4a5568;">
                Have questions? Write to us at <a href="mailto:support@ind2b.com" style="color:#1ac5a9;font-weight:600;text-decoration:none;">support@ind2b.com</a> — we reply fast.
              </p>
              <p style="margin:20px 0 0;font-size:15px;color:#4a5568;">Happy shopping! 🎉<br>
                <span style="font-weight:700;color:#0f2027;">The IND2B Team</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;background:#f8fffe;border-top:1px solid #d0f5ee;text-align:center;">
              <p style="margin:0;font-size:13px;color:#6b7280;">
                <a href="https://ind2b.com" style="color:#1ac5a9;text-decoration:none;font-weight:500;">Website</a>
                &nbsp;&bull;&nbsp;
                <a href="https://ind2b.com/about" style="color:#1ac5a9;text-decoration:none;font-weight:500;">About</a>
                &nbsp;&bull;&nbsp;
                <a href="https://ind2b.com/contact" style="color:#1ac5a9;text-decoration:none;font-weight:500;">Contact</a>
              </p>
              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">&copy; ${year} IND2B. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">This email was sent to <span style="color:#6b7280;">${email}</span></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
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
  const year = new Date().getFullYear()
  const digits = otp.split("")
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="padding:0 4px;"><div style="display:inline-block;width:44px;height:56px;line-height:56px;background:#ffffff;border:2px solid #1ac5a9;border-radius:10px;font-size:28px;font-weight:700;color:#149882;text-align:center;font-family:'Courier New',monospace;box-shadow:0 2px 8px rgba(26,197,169,0.15);">${d}</div></td>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - IND2B</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0fdf9;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,197,169,0.12),0 1px 4px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#149882 0%,#1ac5a9 60%,#13ebc7 100%);padding:40px 32px 36px;text-align:center;">
              <div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;line-height:52px;font-size:26px;margin-bottom:16px;">
                <img src="https://ind2b.com/logo1.webp" alt="IND2B" width="140" height="auto"
  style="filter:brightness(0) invert(1);" />
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Verify Your Email</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Complete your IND2B signup</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 0;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
                Hi there! 👋 Use the verification code below to confirm your email address and activate your IND2B account.
              </p>
            </td>
          </tr>

          <!-- OTP Block -->
          <tr>
            <td style="padding:28px 36px;" align="center">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#1ac5a9;text-transform:uppercase;letter-spacing:1.2px;">Your verification code</p>

              <!-- Digit boxes -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>${digitBoxes}</tr>
              </table>

              <!-- Expiry -->
              <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
                ⏱ Expires in <strong style="color:#374151;">${expiresIn} minutes</strong>
              </p>

              <!-- Copy button (mailto trick — widest email client support) -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:20px auto 0;">
                <tr>
                  <td style="border-radius:8px;border:2px solid #1ac5a9;background:#f0fdf9;">
                    <a href="mailto:?body=${otp}" onclick="try{navigator.clipboard.writeText('${otp}')}catch(e){}" style="display:inline-block;padding:10px 28px;color:#149882;text-decoration:none;font-size:14px;font-weight:600;border-radius:6px;letter-spacing:0.3px;">
                      📋 Copy Code: ${otp}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">Tap the button above to copy the code instantly</p>
            </td>
          </tr>

          <!-- Security notice -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                      <strong>🔒 Security reminder:</strong> IND2B will <em>never</em> ask you to share this code by phone, chat, or email. If someone asks — it's a scam.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Not you -->
          <tr>
            <td style="padding:0 36px 32px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
                Didn't request this? You can safely ignore this email — your account won't be created without verification.
              </p>
              <p style="margin:18px 0 0;font-size:14px;color:#6b7280;">
                Best regards,<br><strong style="color:#0f2027;">The IND2B Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;background:#f8fffe;border-top:1px solid #d0f5ee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${year} IND2B. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Sent to: <span style="color:#6b7280;">${email}</span></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
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
  const year = new Date().getFullYear()
  const digits = otp.split("")
  const digitBoxes = digits
    .map(
      (d) =>
        `<td style="padding:0 4px;"><div style="display:inline-block;width:44px;height:56px;line-height:56px;background:#ffffff;border:2px solid #1ac5a9;border-radius:10px;font-size:28px;font-weight:700;color:#149882;text-align:center;font-family:'Courier New',monospace;box-shadow:0 2px 8px rgba(26,197,169,0.15);">${d}</div></td>`,
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Code - IND2B</title>
</head>
<body style="margin:0;padding:0;background-color:#f0fdf9;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0fdf9;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(26,197,169,0.12),0 1px 4px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f766e 0%,#149882 50%,#1ac5a9 100%);padding:40px 32px 36px;text-align:center;">
              <div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;line-height:52px;font-size:26px;margin-bottom:16px;">
               <img src="https://ind2b.com/logo1.webp" alt="IND2B" width="140" height="auto"
  style="filter:brightness(0) invert(1);" />
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">Your Login Code</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">IND2B secure sign-in</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 0;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:#374151;">
                Hi! 👋 We received a login request for your IND2B account. Use the code below to sign in securely.
              </p>
            </td>
          </tr>

          <!-- OTP Block -->
          <tr>
            <td style="padding:28px 36px;" align="center">
              <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#1ac5a9;text-transform:uppercase;letter-spacing:1.2px;">Your login code</p>

              <!-- Digit boxes -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>${digitBoxes}</tr>
              </table>

              <!-- Expiry -->
              <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
                ⏱ Valid for <strong style="color:#374151;">${expiresIn} minutes</strong> only
              </p>

              <!-- Copy button -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:20px auto 0;">
                <tr>
                  <td style="border-radius:8px;border:2px solid #1ac5a9;background:#f0fdf9;">
                    <a href="mailto:?body=${otp}" onclick="try{navigator.clipboard.writeText('${otp}')}catch(e){}" style="display:inline-block;padding:10px 28px;color:#149882;text-decoration:none;font-size:14px;font-weight:600;border-radius:6px;letter-spacing:0.3px;">
                      📋 Copy Code: ${otp}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">Tap the button above to copy the code instantly</p>
            </td>
          </tr>

          <!-- Security alert -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
                      <strong>🚨 Didn't request this?</strong> If you didn't try to log in, someone may have your email. Please change your password immediately and contact <a href="mailto:support@ind2b.com" style="color:#b91c1c;font-weight:600;">support@ind2b.com</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding:0 36px 32px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#6b7280;">
                Never share this code with anyone — IND2B staff will never ask for it.
              </p>
              <p style="margin:18px 0 0;font-size:14px;color:#6b7280;">
                Best regards,<br><strong style="color:#0f2027;">The IND2B Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;background:#f8fffe;border-top:1px solid #d0f5ee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${year} IND2B. All rights reserved.</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">Sent to: <span style="color:#6b7280;">${email}</span></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
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





/**
 * Role config per role type
 */
const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    emoji: "🛡️",
    color: "#7c3aed",
    gradientFrom: "#7c3aed",
    gradientTo: "#4f46e5",
    badgeBg: "#ede9fe",
    badgeColor: "#5b21b6",
    loginPath: "/admin",
    loginLabel: "Go to Admin Dashboard",
    perks: [
      "Full platform management access",
      "User & seller management",
      "Analytics & reporting dashboard",
      "Content & blog management",
      "Order & inventory oversight",
    ],
  },
  seller: {
    label: "Seller",
    emoji: "🏪",
    color: "#059669",
    gradientFrom: "#059669",
    gradientTo: "#0d9488",
    badgeBg: "#d1fae5",
    badgeColor: "#065f46",
    loginPath: "/seller",
    loginLabel: "Go to Seller Dashboard",
    perks: [
      "List and manage your products",
      "Track orders in real-time",
      "Sales analytics & revenue reports",
      "Customer messages & reviews",
      "Promotional tools & discounts",
    ],
  },
  customer: {
    label: "Customer",
    emoji: "🛒",
    color: "#2563eb",
    gradientFrom: "#2563eb",
    gradientTo: "#7c3aed",
    badgeBg: "#dbeafe",
    badgeColor: "#1e40af",
    loginPath: "/",
    loginLabel: "Start Shopping Now",
    perks: [
      "Browse thousands of products",
      "Exclusive member deals & offers",
      "Order tracking & history",
      "Wishlist & saved items",
      "Priority customer support",
    ],
  },
} as const
 
/**
 * Generate role update email template
 */
export function generateRoleUpdateEmail({
  name,
  email,
  newRole,
  previousRole,
  appUrl,
}: {
  name: string
  email: string
  newRole: "admin" | "seller" | "customer"
  previousRole: string
  appUrl: string
}): string {
  const role = ROLE_CONFIG[newRole]
  const loginUrl = `${appUrl}${role.loginPath}`
  const year = new Date().getFullYear()
 
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Role Updated - IND2B</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f1f5f9;">
 
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-height:100vh;">
        <tr>
          <td align="center" style="padding:32px 16px;">
 
            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.10);">



              
 
              <!-- Header gradient banner -->
              <tr>
                <td style="background:linear-gradient(135deg,${role.gradientFrom} 0%,${role.gradientTo} 100%);padding:44px 32px 36px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:72px;height:72px;line-height:72px;text-align:center;font-size:36px;margin-bottom:16px;">
                    ${role.emoji}
                  </div>
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Role Updated Successfully</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.88);font-size:15px;">Your IND2B account access has changed</p>
                </td>
              </tr>
 
              <!-- Greeting -->
              <tr>
                <td style="padding:36px 32px 0;">
                  <p style="margin:0;font-size:16px;color:#1e293b;line-height:1.6;">
                    Hi <strong>${name}</strong>,
                  </p>
                  <p style="margin:12px 0 0;font-size:15px;color:#475569;line-height:1.7;">
                    Your account role on <strong>IND2B</strong> has been updated by an administrator. Here's a summary of the change:
                  </p>
                </td>
              </tr>
 
              <!-- Role change summary -->
              <tr>
                <td style="padding:24px 32px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <!-- Previous role -->
                            <td style="width:42%;text-align:center;padding:12px;">
                              <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">Previous Role</p>
                              <div style="margin:8px auto 0;display:inline-block;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:20px;padding:6px 16px;">
                                <span style="font-size:14px;font-weight:600;color:#64748b;text-transform:capitalize;">${previousRole}</span>
                              </div>
                            </td>
                            <!-- Arrow -->
                            <td style="width:16%;text-align:center;vertical-align:middle;">
                              <span style="font-size:22px;color:${role.color};">→</span>
                            </td>
                            <!-- New role -->
                            <td style="width:42%;text-align:center;padding:12px;">
                              <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;">New Role</p>
                              <div style="margin:8px auto 0;display:inline-block;background:${role.badgeBg};border:1px solid ${role.color}33;border-radius:20px;padding:6px 16px;">
                                <span style="font-size:14px;font-weight:700;color:${role.badgeColor};text-transform:capitalize;">${role.label} ${role.emoji}</span>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
 
              <!-- What you can do now -->
              <tr>
                <td style="padding:28px 32px 0;">
                  <p style="margin:0;font-size:15px;font-weight:600;color:#1e293b;">What you can do as a ${role.label}:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:14px;">
                    ${role.perks.map((perk) => `
                    <tr>
                      <td style="padding:5px 0;">
                        <table cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td style="width:24px;vertical-align:top;padding-top:1px;">
                              <div style="width:20px;height:20px;background:${role.badgeBg};border-radius:50%;text-align:center;line-height:20px;font-size:11px;">✓</div>
                            </td>
                            <td style="padding-left:10px;font-size:14px;color:#475569;line-height:1.5;">${perk}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>`).join("")}
                  </table>
                </td>
              </tr>
 
              <!-- CTA Button -->
              <tr>
                <td style="padding:32px 32px 0;text-align:center;">
                  <a href="${loginUrl}"
                    style="display:inline-block;background:linear-gradient(135deg,${role.gradientFrom},${role.gradientTo});color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;box-shadow:0 4px 14px ${role.color}44;">
                    ${role.loginLabel} &rarr;
                  </a>
                  <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">
                    Or copy this link: <span style="color:${role.color};">${loginUrl}</span>
                  </p>
                </td>
              </tr>
 
              <!-- Security note -->
              <tr>
                <td style="padding:24px 32px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:0;">
                    <tr>
                      <td style="padding:14px 16px;">
                        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                          <strong>⚠️ Didn't expect this?</strong> If you believe this change was made in error, please contact our support team immediately at
                          <a href="mailto:support@ind2b.com" style="color:#b45309;text-decoration:underline;">support@ind2b.com</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
 
              <!-- Footer -->
              <tr>
                <td style="padding:32px;text-align:center;border-top:1px solid #e2e8f0;margin-top:32px;">
                  <p style="margin:0;font-size:13px;color:#94a3b8;">© ${year} IND2B. All rights reserved.</p>
                  <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">This email was sent to <strong style="color:#94a3b8;">${email}</strong></p>
                </td>
              </tr>
 
            </table>
            <!-- End Card -->
 
          </td>
        </tr>
      </table>
 
    </body>
    </html>
  `
}










/**
 * Generate blog newsletter email template
 */
export function generateBlogNewsletterEmail({
  blogTitle,
  blogExcerpt,
  blogSlug,
  blogAuthor,
  blogCoverImage,
  blogTags = [],
  publishedAt,
  subscriberEmail,
}: {
  blogTitle: string
  blogExcerpt: string
  blogSlug: string
  blogAuthor: string
  blogCoverImage?: string
  blogTags?: string[]
  publishedAt?: Date | null
  subscriberEmail: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ind2b.com"
  const blogUrl = `${appUrl}/blog/${blogSlug}`
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`
  const year = new Date().getFullYear()
  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
 
  const tagsHtml = blogTags.length
    ? blogTags
        .slice(0, 4)
        .map(
          (tag) =>
            `<span style="display:inline-block;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:600;margin:2px 3px 2px 0;text-transform:uppercase;letter-spacing:0.5px;">${tag}</span>`
        )
        .join("")
    : ""
 
  const coverImageHtml = blogCoverImage
    ? `<tr>
        <td style="padding:0;">
          <img src="${blogCoverImage}" alt="${blogTitle}"
            style="width:100%;max-height:260px;object-fit:cover;display:block;border-radius:0;" />
        </td>
      </tr>`
    : ""
 
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Blog Post - ${blogTitle} | IND2B</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f1f5f9;">
 
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding:32px 16px;">
 
            <!-- Card -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
              style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.10);">
 
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding:20px 28px 16px;background:#ffffff;border-bottom:1px solid #e2e8f0;">
                  <a href="${appUrl}" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">
                    <img src="${appUrl}/logo1.webp" alt="IND2B" width="40" height="40"
                      style="display:inline-block;border-radius:8px;vertical-align:middle;" />
                    <span style="font-size:20px;font-weight:800;color:#059669;vertical-align:middle;letter-spacing:-0.5px;">IND2B</span>
                  </a>
                </td>
              </tr>
 
              <!-- Hero Banner -->
              <tr>
                <td style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:32px 28px 28px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 18px;margin-bottom:14px;">
                    <span style="color:rgba(255,255,255,0.95);font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">📰 New Blog Post</span>
                  </div>
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.35;letter-spacing:-0.3px;">
                    ${blogTitle}
                  </h1>
                  <p style="margin:10px 0 0;color:rgba(255,255,255,0.80);font-size:13px;">
                    By <strong style="color:rgba(255,255,255,0.95);">${blogAuthor}</strong> &nbsp;·&nbsp; ${dateStr}
                  </p>
                </td>
              </tr>
 
              <!-- Cover Image -->
              ${coverImageHtml}
 
              <!-- Body -->
              <tr>
                <td style="padding:28px 28px 0;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">What's New on IND2B</p>
                  <p style="margin:0;font-size:15px;color:#374151;line-height:1.75;">${blogExcerpt}</p>
                </td>
              </tr>
 
              <!-- Tags -->
              ${
                tagsHtml
                  ? `<tr>
                <td style="padding:18px 28px 0;">
                  ${tagsHtml}
                </td>
              </tr>`
                  : ""
              }
 
              <!-- CTA Button -->
              <tr>
                <td style="padding:28px 28px 0;text-align:center;">
                  <a href="${blogUrl}"
                    style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:10px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(5,150,105,0.35);">
                    Read Full Article &rarr;
                  </a>
                </td>
              </tr>
 
              <!-- Divider + Why you received this -->
              <tr>
                <td style="padding:28px 28px 0;">
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;" />
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                    <tr>
                      <td style="padding:16px 20px;">
                        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                          📬 You're receiving this because you subscribed to <strong>IND2B newsletters</strong>.
                          Stay updated with the latest industry insights, product news, and more.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
 
              <!-- Footer -->
              <tr>
                <td style="padding:24px 28px 28px;text-align:center;">
                  <p style="margin:0;font-size:13px;color:#94a3b8;">
                    © ${year} IND2B. All rights reserved.
                  </p>
                  <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1;">
                    This email was sent to <strong style="color:#94a3b8;">${subscriberEmail}</strong>
                  </p>
                  <p style="margin:8px 0 0;font-size:12px;">
                    <a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
                    &nbsp;·&nbsp;
                    <a href="${appUrl}/blog" style="color:#94a3b8;text-decoration:underline;">View all posts</a>
                  </p>
                </td>
              </tr>
 
            </table>
            <!-- End Card -->
 
          </td>
        </tr>
      </table>
 
    </body>
    </html>
  `
}