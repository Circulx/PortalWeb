import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  product_id: { type: Number, unique: true },
  title: { type: String, required: true },
  model: String,
  description: String,
  category_id: Number,
  sub_category_id: Number,
  units: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  image_link: String,
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: Number,
  SKU: { type: String, required: true },
  seller_id: Number,
  created_at: { type: Date, default: Date.now },
  rating: Number,
  updated_at: { type: Date, default: Date.now },
  seller_name: { type: String, required: true },
  location: { type: String, required: true },
  category_name: { type: String, required: true },
  sub_category_name: String,
  is_draft: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
})

// Auto-increment product_id
productSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const Product = mongoose.model("Product")
      const lastProduct = await Product.findOne({}, {}, { sort: { product_id: -1 } })
      this.product_id = lastProduct ? lastProduct.product_id + 1 : 1
      next()
    } catch (error) {
      next(error as Error)
    }
  } else {
    next()
  }
})

export default mongoose.models.Product || mongoose.model("Product", productSchema)

