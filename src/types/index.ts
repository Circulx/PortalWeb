export interface Product {
  id: string
  name: string
  productName: string
  category: string
  description: string
  skuCode: string
  stock: number
  price: number
  status: boolean
  image?: string
  weight: string
  length: string
  width: string
  breadth: string
  availableQuantity: string
  pricePerUnit: string
  discount: string
  discountType: string
  dimensions: {
    length: number
    width: number
    height: number
  }
}

export type CategoryType = "All" | "Electronics" | "Clothing" | "Home & Kitchen" | "Books" | string

export interface ProductFormData {
  title: string
  model?: string
  description?: string
  category_id?: number
  sub_category_id?: number
  units?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  image_link?: string
  stock: number
  price: number
  discount?: number
  SKU: string
  seller_name: string
  location: string
  category_name: string
  sub_category_name?: string
  is_draft?: boolean
}
