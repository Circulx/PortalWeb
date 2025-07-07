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
}

// Initial state
const initialState: AdvertisementState = {
  advertisements: [],
  status: "idle",
  error: null,
  lastFetched: null,
  deviceType: null,
}

// Fetch active advertisements
export const fetchAdvertisements = createAsyncThunk(
  "advertisements/fetchAdvertisements",
  async (deviceType: string, { getState, rejectWithValue }) => {
    const state = getState() as { advertisements: AdvertisementState }

    // If advertisements are already loaded and it's been less than 30 minutes, don't fetch again
    const thirtyMinutesInMs = 30 * 60 * 1000
    if (
      state.advertisements.advertisements.length > 0 &&
      state.advertisements.lastFetched &&
      Date.now() - state.advertisements.lastFetched < thirtyMinutesInMs &&
      state.advertisements.deviceType === deviceType
    ) {
      console.log("Using cached advertisements (less than 30 minutes old)")
      return { advertisements: state.advertisements.advertisements, fromCache: true }
    }

    try {
      console.log(`Fetching advertisements for device type: ${deviceType}`)
      const response = await fetch(`/api/advertisements/active?deviceType=${deviceType}`)

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
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("Error fetching advertisements:", errorMessage)
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvertisements.pending, (state) => {
        state.status = "loading"
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

          // Only update lastFetched if this wasn't from cache
          if (!action.payload.fromCache) {
            state.lastFetched = Date.now()
            state.deviceType = action.payload.deviceType || null
          }

          state.error = null
        },
      )
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearAdvertisements } = advertisementSlice.actions
export default advertisementSlice.reducer
