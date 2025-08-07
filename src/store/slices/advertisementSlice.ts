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

// Ultra-fast fetch with aggressive caching and immediate response
export const fetchAdvertisements = createAsyncThunk(
  "advertisements/fetchAdvertisements",
  async (deviceType: string, { getState, rejectWithValue }) => {
    const state = getState() as { advertisements: AdvertisementState }

    // Very aggressive caching - 15 minutes for maximum performance
    const cacheValidityDuration = 15 * 60 * 1000
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
      // Return cached data immediately - no network request
      return {
        advertisements: state.advertisements.advertisements,
        fromCache: true,
        deviceType,
        responseTime: 0,
      }
    }

    const startTime = Date.now()

    try {
      // Ultra-fast timeout for immediate response
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1500) // 1.5 second timeout

      const response = await fetch(`/api/advertisements/active?deviceType=${deviceType}`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes browser cache
          Accept: "application/json",
        },
        // Add priority hint for faster loading
        priority: "high" as any,
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch advertisements")
      }

      console.log(`Advertisements fetched in ${responseTime}ms`)

      return {
        advertisements: result.data || [],
        fromCache: false,
        deviceType,
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (error instanceof Error && error.name === "AbortError") {
        console.warn(`Advertisement fetch timeout after ${responseTime}ms`)
        // Return empty array on timeout instead of failing
        return {
          advertisements: [],
          fromCache: false,
          deviceType,
          responseTime,
        }
      }

      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`Advertisement fetch failed after ${responseTime}ms:`, errorMessage)
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
    preloadAdvertisements: (state, action: PayloadAction<{ advertisements: Advertisement[]; deviceType?: string }>) => {
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

export const { clearAdvertisements, markAsInitialized, preloadAdvertisements, loadFromCache } = advertisementSlice.actions
export default advertisementSlice.reducer
