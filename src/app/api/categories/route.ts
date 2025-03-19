import { connectDB2 } from '@/lib/db';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

interface Category {
  category_id: number;
  category_name: string;
  created_at?: string;
}

const categorySchema = new mongoose.Schema<Category>({
  category_id: { type: Number, required: true },
  category_name: { type: String, required: true },
  created_at: { type: String }
});

const db2 = await connectDB2();

const CategoryModel = db2.models.Category || db2.model<Category>('Category', categorySchema);

export async function GET() {
  try {
    await connectDB2();
    const categories = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "products",        // Collection name for products
          localField: "category_id",
          foreignField: "category_id",
          as: "products"
        }
      },
      {
        $addFields: {
          product_count: { $size: "$products" }
        }
      },
      {
        $project: {
          products: 0              // Remove the temporary products array
        }
      }
    ]);

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB2();
    const categoryData = await request.json();
    const newCategory = new CategoryModel(categoryData);
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error posting category:', error);
    return NextResponse.json({ error: 'Error posting category' }, { status: 500 });
  }
}
