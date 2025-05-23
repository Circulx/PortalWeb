import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/prod_db"
import mongoose from "mongoose"

// Define the Category schema
const categorySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  sub_categories: [{ id: Number, name: String }],
})

// Create or get the model
let Category: mongoose.Model<any>
try {
  Category = mongoose.model("Category")
} catch {
  Category = mongoose.model("Category", categorySchema)
}

// Sample categories data for initial seeding
const sampleCategories = [
  {
    id: 1,
    name: "Electronics",
    sub_categories: [
      { id: 101, name: "Smartphones" },
      { id: 102, name: "Laptops" },
      { id: 103, name: "Accessories" },
    ],
  },
  {
    id: 2,
    name: "Clothing",
    sub_categories: [
      { id: 201, name: "Men's Wear" },
      { id: 202, name: "Women's Wear" },
      { id: 203, name: "Kids' Wear" },
    ],
  },
  {
    id: 3,
    name: "Home & Kitchen",
    sub_categories: [
      { id: 301, name: "Furniture" },
      { id: 302, name: "Appliances" },
      { id: 303, name: "Kitchenware" },
    ],
  },
  {
    id: 4,
    name: "Books",
    sub_categories: [
      { id: 401, name: "Fiction" },
      { id: 402, name: "Non-Fiction" },
      { id: 403, name: "Educational" },
    ],
  },
]

// GET handler to fetch categories
export async function GET() {
  try {
    await connectDB()

    // Check if categories exist
    let categories = await Category.find({}).lean()

    // If no categories, seed with sample data
    if (categories.length === 0) {
      await Category.insertMany(sampleCategories)
      categories = await Category.find({}).lean()
    }

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error("Error fetching categories:", error)

    // Return sample categories as fallback
    return NextResponse.json(sampleCategories)
  }
}

// POST handler to add a new category or subcategory
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const data = await req.json()
    console.log("Received category data:", data)
    const { categoryName, subCategoryName, parentCategoryId } = data

    // If adding a subcategory to an existing category
    if (parentCategoryId && subCategoryName) {
      const category = await Category.findOne({ id: parentCategoryId })

      if (!category) {
        console.error(`Parent category with ID ${parentCategoryId} not found`)
        return NextResponse.json({ error: "Parent category not found" }, { status: 404 })
      }

      // Check if subcategory already exists
      const subCategoryExists = category.sub_categories.some(
        (sub: any) => sub.name.toLowerCase() === subCategoryName.toLowerCase(),
      )

      if (subCategoryExists) {
        return NextResponse.json({ error: "Subcategory already exists" }, { status: 400 })
      }

      // Generate a new subcategory ID
      const highestSubId = category.sub_categories.reduce((max: number, sub: any) => (sub.id > max ? sub.id : max), 0)

      const newSubCategory = {
        id: highestSubId + 1,
        name: subCategoryName,
      }

      // Add the new subcategory
      category.sub_categories.push(newSubCategory)
      await category.save()

      return NextResponse.json(category)
    }

    // If adding a new main category
    if (categoryName) {
      // Check if category already exists
      const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryName}$`, "i") },
      })

      if (categoryExists) {
        return NextResponse.json({ error: "Category already exists" }, { status: 400 })
      }

      // Generate a new category ID - ensure it's a valid number
      let nextCategoryId = 1

      const highestCategory = await Category.findOne().sort({ id: -1 })
      if (highestCategory && typeof highestCategory.id === "number") {
        nextCategoryId = highestCategory.id + 1
      }

      // Create the new category
      const newCategory = new Category({
        id: nextCategoryId,
        name: categoryName,
        sub_categories: [],
      })

      await newCategory.save()

      return NextResponse.json(newCategory, { status: 201 })
    }

    console.error("Invalid request data:", data)
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
  } catch (error: any) {
    console.error("Error adding category:", error)
    return NextResponse.json({ error: "Failed to add category", message: error.message }, { status: 500 })
  }
}
