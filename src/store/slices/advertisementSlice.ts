import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Define the Advertisement interface
export interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl?: string
  imageData?: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  position: "homepage" | "category" | "bottomofhomepage" | "cart" | "wishlist" | "all"
  startDate?: string
  endDate?: string
}

// Define the state structure
interface AdvertisementState {
  advertisements: Advertisement[]
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: number | null
  deviceType: string | null
  isInitialized: boolean
}

// Initial state
const initialState: AdvertisementState = {
  advertisements: [],
  status: "idle",
  error: null,
  lastFetched: null,
  deviceType: null,
  isInitialized: false,
}

export const fetchAdvertisements = createAsyncThunk(
  "advertisements/fetchAdvertisements",
  async (
    { deviceType, position = "all" }: { deviceType: string; position?: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as { advertisements: AdvertisementState }

    const cacheValidityDuration = 5 * 60 * 1000 // Reduced cache duration to 5 minutes
    const now = Date.now()

    // Check if we have valid cached data - return immediately
    if (
      state.advertisements.isInitialized &&
      state.advertisements.advertisements.length > 0 &&
      state.advertisements.lastFetched &&
      now - state.advertisements.lastFetched < cacheValidityDuration &&
      (state.advertisements.deviceType === deviceType || state.advertisements.deviceType === "all") &&
      state.advertisements.status === "succeeded"
    ) {
      console.log("[v0] Using cached advertisements:", state.advertisements.advertisements.length)
      return {
        advertisements: state.advertisements.advertisements,
        fromCache: true,
        deviceType,
        position,
        responseTime: 0,
      }
    }

    const startTime = Date.now()
    console.log("[v0] Fetching ALL advertisements for:", { deviceType, position })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // Increased timeout to 5 seconds

      const url = `/api/advertisements/active?deviceType=${deviceType}&position=all`
      console.log("[v0] Fetching from URL:", url)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache", // Force fresh data
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] API Response:", result)
      console.log("[v0] Total advertisements received:", result.data?.length || 0)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch advertisements")
      }

      console.log(`[v0] ALL advertisements fetched in ${responseTime}ms:`, result.data?.length || 0)

      return {
        advertisements: result.data || [],
        fromCache: false,
        deviceType,
        position: "all", // Always set position to "all"
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`[v0] Advertisement fetch failed after ${responseTime}ms:`, error)

      if (error instanceof Error && error.name === "AbortError") {
        console.warn(`[v0] Advertisement fetch timeout after ${responseTime}ms`)

        if (state.advertisements.advertisements.length > 0) {
          return {
            advertisements: state.advertisements.advertisements,
            fromCache: true,
            deviceType,
            position: "all",
            responseTime,
          }
        }
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return rejectWithValue(errorMessage)
    }
  },
)

// Create the slice
const advertisementSlice = createSlice({
  name: "advertisements",
  initialState,
  reducers: {
    clearAdvertisements: (state) => {
      state.advertisements = []
      state.status = "idle"
      state.lastFetched = null
      state.deviceType = null
      state.isInitialized = false
    },
    markAsInitialized: (state) => {
      state.isInitialized = true
    },
    // Preload action for instant loading
    preloadAdvertisements: (
      state,
      action: PayloadAction<{ advertisements: Advertisement[]; deviceType?: string; position?: string }>,
    ) => {
      state.advertisements = action.payload.advertisements
      state.status = "succeeded"
      state.isInitialized = true
      state.lastFetched = Date.now()
      state.deviceType = action.payload.deviceType || "all"
      state.error = null
    },
    // Instant load from cache
    loadFromCache: (state, action: PayloadAction<Advertisement[]>) => {
      if (state.advertisements.length === 0) {
        state.advertisements = action.payload
        state.status = "succeeded"
        state.isInitialized = true
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvertisements.pending, (state) => {
        // Only set loading if we don't have any data at all
        if (!state.isInitialized || state.advertisements.length === 0) {
          state.status = "loading"
        }
        state.error = null
      })
      .addCase(
        fetchAdvertisements.fulfilled,
        (
          state,
          action: PayloadAction<{
            advertisements: Advertisement[]
            fromCache: boolean
            deviceType?: string
            position?: string
            responseTime?: number
          }>,
        ) => {
          state.status = "succeeded"
          state.advertisements = action.payload.advertisements
          state.isInitialized = true

          // Only update lastFetched if this wasn't from cache
          if (!action.payload.fromCache) {
            state.lastFetched = Date.now()
            state.deviceType = action.payload.deviceType || null
          }

          state.error = null
        },
      )
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        // Don't change status to failed if we have cached data
        if (state.advertisements.length === 0) {
          state.status = "failed"
        }
        state.error = action.payload as string
        state.isInitialized = true
      })
  },
})

export const { clearAdvertisements, markAsInitialized, preloadAdvertisements, loadFromCache } =
  advertisementSlice.actions
export default advertisementSlice.reducer
