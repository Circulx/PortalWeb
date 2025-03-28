import { NextResponse } from "next/server"
import { connectDB } from "@/lib/prod_db"
import mongoose from "mongoose"
import { ProductModel } from "@/models/product"


export async function GET() {
  try {
    // Connect to the database
    await connectDB()

    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray()
        console.log(
          "Available collections:",
          collections.map((c) => c.name),
        )
      } catch (err) {
        console.error("Error listing collections:", err)
      }
    }

    // Try the aggregation pipeline with exact collection names from your DB
    try {
      const products = await ProductModel.aggregate([
        {
          $lookup: {
            from: "sellers", // Exact collection name from your DB
            localField: "seller_id",
            foreignField: "seller_id",
            as: "seller",
          },
        },
        {
          $lookup: {
            from: "categories", // Exact collection name from your DB
            localField: "category_id",
            foreignField: "category_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "subcategories", // Exact collection name from your DB
            localField: "sub_category_id",
            foreignField: "sub_category_id",
            as: "sub_category",
          },
        },
        {
          $addFields: {
            seller_name: { $ifNull: [{ $arrayElemAt: ["$seller.seller_name", 0] }, "Unknown Seller"] },
            location: { $ifNull: [{ $arrayElemAt: ["$seller.location", 0] }, "Unknown Location"] },
            category_name: { $ifNull: [{ $arrayElemAt: ["$category.category_name", 0] }, "Uncategorized"] },
            sub_category_name: { $ifNull: [{ $arrayElemAt: ["$sub_category.sub_category_name", 0] }, "Uncategorized"] },
          },
        },
        {
          $project: {
            seller: 0,
            category: 0,
            sub_category: 0,
          },
        },
      ]).exec()

      console.log(`Found ${products.length} products after aggregation`)

      if (products.length > 0) {
        return NextResponse.json(products, { status: 200 })
      }
    } catch (aggregationError) {
      console.error("Aggregation error:", aggregationError)
      // Continue to fallback query
    }

    // Fallback to simple find query if aggregation fails or returns no results
    const simpleProducts = await ProductModel.find({}).lean()
    console.log(`Found ${simpleProducts.length} products with simple query`)

    if (simpleProducts.length > 0) {
      return NextResponse.json(simpleProducts, { status: 200 })
    }

    // If still no products, try to get a sample document to debug
    try {
      // Only try direct collection access if db is available
      if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
        const sampleProduct = await mongoose.connection.db.collection("products").findOne({})
        console.log("Sample product from direct collection access:", sampleProduct)

        if (sampleProduct) {
          // If we found a product this way, return it
          return NextResponse.json([sampleProduct], { status: 200 })
        }
      }
    } catch (directError) {
      console.error("Error with direct collection access:", directError)
    }

    // If still no products, return empty array
    return NextResponse.json([], { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error fetching products:", errorMessage)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const productData = await request.json()
    const newProduct = new ProductModel(productData)
    await newProduct.save()
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error posting product:", errorMessage)
    return NextResponse.json({ error: "Error posting product" }, { status: 500 })
  }
}

