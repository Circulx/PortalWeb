// Normalize and uppercase the GSTIN
export function normalizeGSTIN(gstinRaw: string) {
  return (gstinRaw || "").replace(/\s+/g, "").toUpperCase()
}

// Basic GSTIN format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric (1-9,A-Z) + 'Z' + 1 alphanumeric
export function isValidGSTINFormat(gstinRaw: string) {
  const gstin = normalizeGSTIN(gstinRaw)
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return regex.test(gstin)
}

// ISO 7064 MOD 36,2-like checksum used by GSTIN
// Mapping: 0-9 => 0-9, A-Z => 10-35
function charToValue(ch: string) {
  const code = ch.charCodeAt(0)
  if (code >= 48 && code <= 57) return code - 48 // '0'-'9'
  if (code >= 65 && code <= 90) return code - 55 // 'A'-'Z' => 10-35
  return -1
}
function valueToChar(val: number) {
  if (val >= 0 && val <= 9) return String.fromCharCode(48 + val)
  if (val >= 10 && val <= 35) return String.fromCharCode(55 + val)
  return ""
}

// Algorithm summary:
// For first 14 chars:
//  - weight = i % 2 === 0 ? 1 : 2
//  - product = val * weight
//  - sum += Math.floor(product / 36) + (product % 36)
// checkVal = (36 - (sum % 36)) % 36
// checkChar must equal 15th char
export function isValidGSTINChecksum(gstinRaw: string) {
  const gstin = normalizeGSTIN(gstinRaw)
  if (gstin.length !== 15) return false

  let sum = 0
  for (let i = 0; i < 14; i++) {
    const val = charToValue(gstin[i])
    if (val < 0) return false
    const weight = i % 2 === 0 ? 1 : 2
    const product = val * weight
    sum += Math.floor(product / 36) + (product % 36)
  }
  const checkVal = (36 - (sum % 36)) % 36
  const expectedCheckChar = valueToChar(checkVal)
  return expectedCheckChar === gstin[14]
}

export function isLikelyValidGSTIN(gstinRaw: string) {
  return isValidGSTINFormat(gstinRaw) && isValidGSTINChecksum(gstinRaw)
}

export type GSTVerificationResult = {
  valid: boolean
  legalName?: string
  tradeName?: string
  stateCode?: string
  status?: string
  raw?: any
  message?: string
  code?: string
  statusCode?: number
}

// Server-side verification against AppyFlow provider (configurable via env)
export async function verifyGSTINWithProvider(gstinRaw: string): Promise<GSTVerificationResult> {
  const gstin = normalizeGSTIN(gstinRaw)

  if (!isLikelyValidGSTIN(gstin)) {
    return { valid: false, message: "Invalid GSTIN format or checksum" }
  }

  // Support both env names; many providers name it KEY_SECRET
  const key = process.env.GST_APPYFLOW_KEY || process.env.GST_APPYFLOW_KEY_SECRET
  if (!key) {
    return {
      valid: false,
      status: "MISSING_PROVIDER_KEY",
      code: "MISSING_GST_API_KEY",
      message: "GST verification service not configured. Please set GST_APPYFLOW_KEY.",
    }
  }

  // Try both parameter names – some accounts use key_secret, others key
  const urls = [
    `https://appyflow.in/api/verifyGST?gstNo=${encodeURIComponent(gstin)}&key_secret=${encodeURIComponent(key)}`,
    `https://appyflow.in/api/verifyGST?gstNo=${encodeURIComponent(gstin)}&key=${encodeURIComponent(key)}`,
  ]

  let lastError: GSTVerificationResult | null = null

  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } })
      const statusCode = res.status
      if (!res.ok) {
        lastError = {
          valid: false,
          status: `HTTP_${statusCode}`,
          statusCode,
          message: `GST provider returned HTTP ${statusCode}`,
        }
        continue
      }

      const data = await res.json().catch(() => ({}) as any)

      // Common payload shapes:
      // { taxpayerInfo: { lgnm, tradeNam, sts, pradr:{stcd} }, success: true }
      // { gstinInfo: {...}, valid: true }
      // { data: {...}, flag: true }
      // { valid: true, message: "..." }
      const info = data?.taxpayerInfo || data?.gstinInfo || data?.data || data

      const legalName: string | undefined =
        info?.lgnm || info?.legalName || info?.legal_name || info?.lgnmName || info?.organizationName
      const tradeName: string | undefined = info?.tradeNam || info?.tradeName
      const stateCode: string | undefined = info?.pradr?.stcd || info?.stateCode || info?.stcd
      const statusRaw: string | undefined = info?.sts || info?.status || data?.status
      const statusLower = String(statusRaw || "").toLowerCase()

      // Accept a variety of validity flags from providers
      const providerFlags = [
        Boolean(data?.valid),
        Boolean(data?.Valid),
        Boolean(data?.isvalid),
        Boolean(data?.isValid),
        Boolean(data?.flag),
        Boolean(data?.success),
        String(data?.status).toLowerCase() === "success",
        String(info?.valid).toLowerCase() === "true",
        String(info?.isValid).toLowerCase() === "true",
      ]

      let isActive = false
      if (statusLower) {
        // Consider active if includes 'active' and does not indicate 'cancel', 'inactive', or 'surrender'
        isActive =
          statusLower.includes("active") &&
          !statusLower.includes("cancel") &&
          !statusLower.includes("inactive") &&
          !statusLower.includes("surrender")
      }

      // Heuristic: valid if any provider flag is true OR we have a name and not cancelled/inactive
      let computedValid = providerFlags.some(Boolean) || Boolean(legalName || tradeName)
      if (statusLower) {
        if (statusLower.includes("cancel") || statusLower.includes("inactive") || statusLower.includes("surrender")) {
          computedValid = false
        } else if (statusLower.includes("active")) {
          computedValid = true
        }
      }

      const message: string | undefined =
        data?.message ||
        data?.Message ||
        data?.error ||
        data?.Error ||
        (computedValid ? "GST verified" : "GST not verified")

      return {
        valid: computedValid,
        legalName,
        tradeName,
        stateCode,
        status: statusRaw,
        raw: data,
        message,
        statusCode,
      }
    } catch (err: any) {
      lastError = {
        valid: false,
        status: "ERROR",
        message: err?.message || "Unexpected error contacting GST provider",
      }
      // try next URL form
      continue
    }
  }

  // Both attempts failed
  return (
    lastError || {
      valid: false,
      status: "ERROR",
      message: "Unable to reach GST verification provider",
    }
  )
}
