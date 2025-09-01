import { NextResponse } from "next/server"
import { isLikelyValidGSTIN, verifyGSTINWithProvider, normalizeGSTIN } from "@/lib/gst"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const gstinRaw = String(body?.gstin || "")
    const gstin = normalizeGSTIN(gstinRaw)

    if (!isLikelyValidGSTIN(gstin)) {
      return NextResponse.json(
        { success: true, valid: false, error: "Invalid GSTIN format or checksum" },
        { status: 200 },
      )
    }

    const result = await verifyGSTINWithProvider(gstin)

    if (result.status === "MISSING_PROVIDER_KEY") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.message || "GST verification service not configured. Please set GST_APPYFLOW_KEY.",
          code: result.code || "MISSING_GST_API_KEY",
        },
        { status: 503 },
      )
    }

    if (!result.valid) {
      return NextResponse.json(
        {
          success: true,
          valid: false,
          error: result.message || "GST could not be verified. Please check and try again.",
          providerStatus: result.status,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        legalName: result.legalName,
        tradeName: result.tradeName,
        stateCode: result.stateCode,
        status: result.status,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[GST] /api/gst/verify error:", error)
    return NextResponse.json({ success: false, valid: false, error: "Unexpected server error" }, { status: 500 })
  }
}
