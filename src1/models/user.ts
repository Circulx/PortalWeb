import mongoose, { Schema, type Document, type Model } from "mongoose"
import { connectDB1 } from "@/lib/db"

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  type: "admin" | "seller" | "customer"
  secondaryEmail?: string
  phoneNumber?: string
  country?: string
  state?: string
  zipCode?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "customer",
    },
    secondaryEmail: { type: String }, // Optional field
    phoneNumber: { type: String }, // Optional field
    country: { type: String }, // Optional field
    state: { type: String }, // Optional field
    zipCode: { type: String }, // Optional field
  },
  { timestamps: true },
)

// This function ensures we get the User model with the correct connection (connectDB1)
export async function getUserModel(): Promise<Model<IUser>> {
  const conn = await connectDB1()
  return conn.models.User || conn.model<IUser>("User", userSchema)
}

// For backward compatibility - DO NOT USE THIS DIRECTLY
// This might be using the wrong connection
export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
