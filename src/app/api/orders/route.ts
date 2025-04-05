import { NextResponse } from "next/server"
import { OrderModel } from "./orders"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "gyuhiuhthoju2596rfyjhtfykjb";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token || !token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode the JWT token to get the buyer_id (user_id)
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
    const buyer_id = parseInt(decoded.userId);
    console.log(buyer_id);
    // Fetch orders for the logged-in user
    const orders = await OrderModel.aggregate([
      {
        $match: {
          buyer_id: buyer_id, // Filter orders by buyer_id
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyer_id",
          foreignField: "user_id",
          as: "buyer",
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "seller_id",
          foreignField: "seller_id",
          as: "seller",
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "payment_id",
          foreignField: "payment_id",
          as: "payment",
        },
      },
      {
        $addFields: {
          buyer_name: { $arrayElemAt: ["$buyer.name", 0] },
          seller_name: { $arrayElemAt: ["$seller.seller_name", 0] },
          payment_status: { $arrayElemAt: ["$payment.status", 0] },
          payment_method: { $arrayElemAt: ["$payment.method", 0] },
        },
      },
      {
        $project: {
          buyer: 0,
          seller: 0,
          payment: 0,
        },
      },
    ]);
    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    console.log("body: ", request.body);
    console.log(token);
    console.log(token?.value);
    if (!token || !token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Decode the JWT token to get the buyer_id (user_id)
    const decoded = jwt.verify(token.value, JWT_SECRET) as { userId: string };
    const buyer_id = parseInt(decoded.userId);

    const { billingDetails, paymentMethod, additionalInfo, amount, razorpayOrderId, cartItems } = await request.json();

    const sellerIds = cartItems.map((item: { seller_id: number }) => item.seller_id);
    const uniqueSellerIds = [...new Set(sellerIds)];
    const seller_id = uniqueSellerIds[0];
    if (!seller_id) {
      return NextResponse.json({ error: "Seller not found for the products in the cart" }, { status: 400 });
    }

    const newOrder = new OrderModel({
      order_id: razorpayOrderId,
      order_date: new Date().toISOString(),
      buyer_id,
      seller_id,
      status: "Paid",
      amount,
      billingDetails,
      paymentMethod,
      additionalInfo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await newOrder.save();

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Error creating order" }, { status: 500 });
  }
}

