import mongoose, { Document, Schema } from "mongoose"

export interface IOTPVerification extends Document {
  email: string
  otp: string
  type: "signup" | "login" | "password-reset"
  expiresAt: Date
  attempts: number
  maxAttempts: number
  createdAt: Date
  updatedAt: Date
  isVerified: boolean
}

const OTPVerificationSchema = new Schema<IOTPVerification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["signup", "login", "password-reset"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired OTPs
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Create compound index for email and type
OTPVerificationSchema.index({ email: 1, type: 1 })

export const OTPVerification =
  mongoose.models.OTPVerification ||
  mongoose.model<IOTPVerification>("OTPVerification", OTPVerificationSchema)
