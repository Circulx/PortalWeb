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

// Optimized fetch with aggressive caching and faster timeout
export const fetchAdvertisements = createAsyncThunk(
  "advertisements/fetchAdvertisements",
  async (deviceType: string, { getState, rejectWithValue }) => {
    const state = getState() as { advertisements: AdvertisementState }

    // Extended cache duration - 30 minutes for better performance
    const cacheValidityDuration = 30 * 60 * 1000
    const now = Date.now()

    // Check if we have valid cached data
    if (
      state.advertisements.isInitialized &&
      state.advertisements.advertisements.length > 0 &&
      state.advertisements.lastFetched &&
      now - state.advertisements.lastFetched < cacheValidityDuration &&
      state.advertisements.deviceType === deviceType &&
      state.advertisements.status === "succeeded"
    ) {
      // Return cached data immediately
      return {
        advertisements: state.advertisements.advertisements,
        fromCache: true,
        deviceType,
      }
    }

    try {
      // Reduced timeout for faster failure detection
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout

      const response = await fetch(`/api/advertisements/active?deviceType=${deviceType}`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "public, max-age=1800", // 30 minutes browser cache
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch advertisements")
      }

      return {
        advertisements: result.data || [],
        fromCache: false,
        deviceType,
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Return empty array on timeout instead of failing
        return {
          advertisements: [],
          fromCache: false,
          deviceType,
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
    // Add preload action for better performance
    preloadAdvertisements: (state, action: PayloadAction<Advertisement[]>) => {
      state.advertisements = action.payload
      state.status = "succeeded"
      state.isInitialized = true
      state.lastFetched = Date.now()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvertisements.pending, (state) => {
        // Only set loading if we don't have cached data
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

export const { clearAdvertisements, markAsInitialized, preloadAdvertisements } = advertisementSlice.actions
export default advertisementSlice.reducer
