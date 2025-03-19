import { connectDB2 } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

interface Seller {
  seller_id: number;
  user_id: number;
  seller_name: string;
  rating_value: number;
  review_count: number;
  contact_no: string;
  location: string;
  created_at?: string;
}

const sellerSchema = new mongoose.Schema<Seller>({
  seller_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  seller_name: { type: String, required: true },
  rating_value: { type: Number, required: true },
  review_count: { type: Number, required: true },
  contact_no: { type: String, required: true },
  location: { type: String, required: true },
  created_at: { type: String }
});

const SellerModel = mongoose.models.Seller || mongoose.model<Seller>('Seller', sellerSchema);

export async function GET() {
  try {
    await connectDB2();
    const sellers = await SellerModel.find().lean();
    return NextResponse.json(sellers, { status: 200 });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json({ error: 'Error fetching sellers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB2();
    const sellerData = await request.json();
    const newSeller = new SellerModel(sellerData);
    await newSeller.save();
    return NextResponse.json(newSeller, { status: 201 });
  } catch (error) {
    console.error('Error posting seller:', error);
    return NextResponse.json({ error: 'Error posting seller' }, { status: 500 });
  }
}

