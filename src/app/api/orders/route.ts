import { connectDB } from '@/lib/prod_db';
import { NextResponse } from 'next/server';
import { OrderModel } from './orders';

export async function GET() {
  try {
    const orders = await OrderModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "buyer_id",
          foreignField: "user_id",
          as: "buyer"
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "seller_id",
          foreignField: "seller_id",
          as: "seller"
        }
      },
      {
        $lookup: {
          from: "payments",
          localField: "payment_id",
          foreignField: "payment_id",
          as: "payment"
        }
      },
      {
        $addFields: {
          buyer_name: { $arrayElemAt: ["$buyer.name", 0] },
          seller_name: { $arrayElemAt: ["$seller.seller_name", 0] },
          payment_status: { $arrayElemAt: ["$payment.status", 0] },
          payment_method: { $arrayElemAt: ["$payment.method", 0] }
        }
      },
      {
        $project: {
          buyer: 0,
          seller: 0,
          payment: 0
        }
      }
    ]);
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const newOrder = new OrderModel({
      ...orderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    await newOrder.save();
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error posting order:', error);
    return NextResponse.json({ error: 'Error posting order' }, { status: 500 });
  }
}