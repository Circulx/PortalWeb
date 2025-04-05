import { NextResponse } from "next/server";
import { connectDB } from "@/lib/prod_db"
import mongoose from "mongoose";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb";

// Define the Address schema
const addressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    billingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        companyName: { type: String },
        address: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        email: { type: String, required: false },
        phone: { type: String, required: true }
    },
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        companyName: { type: String },
        address: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        email: { type: String, required: false },
        phone: { type: String, required: true }
    },
  },
  { timestamps: true }
);

// Create the Address model
const AddressModel =
  mongoose.models.Address || mongoose.model("Address", addressSchema);

// GET: Fetch addresses for a specific user
export async function GET(request: Request) {
  try {

    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token || !token?.value) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Decode the JWT token to get the buyer_id (user_id)
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const addresses = await AddressModel.findOne({ userId });

    if (!addresses) {
      return NextResponse.json(
        { error: "Addresses not found for the user" },
        { status: 404 }
      );
    }

    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Error fetching addresses" },
      { status: 500 }
    );
  }
}

// POST: Add or update addresses for a specific user
export async function POST(request: Request) {
  try {

    await connectDB();

    const body = await request.json();
    const { billingAddress, shippingAddress } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token || !token?.value) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Decode the JWT token to get the buyer_id (user_id)
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    if (!userId || !billingAddress || !shippingAddress) {
      return NextResponse.json(
        { error: "User ID, billingAddress, and shippingAddress are required" },
        { status: 400 }
      );
    }

    // Check if the address already exists for the user
    const existingAddress = await AddressModel.findOne({ userId });

    if (existingAddress) {
      // Update the existing address
      existingAddress.billingAddress = billingAddress;
      existingAddress.shippingAddress = shippingAddress;
      existingAddress.updatedAt = new Date();

      await existingAddress.save();

      return NextResponse.json(
        { message: "Addresses updated successfully", data: existingAddress },
        { status: 200 }
      );
    } else {
      // Create a new address
      const newAddress = new AddressModel({
        userId,
        billingAddress,
        shippingAddress,
      });

      await newAddress.save();

      return NextResponse.json(
        { message: "Addresses created successfully", data: newAddress },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error saving addresses:", error);
    return NextResponse.json(
      { error: "Error saving addresses" },
      { status: 500 }
    );
  }
}