"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { removeFromWishlist } from "@/store/slices/wishlistSlice"
import { addItem } from "@/store/slices/cartSlice"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"

interface Product {
  product_id: number
  title: string
  image_link: string
  price: number
  discount?: number
  seller_id: number
  units?: string
  stock: number
  id: string
}

export default function WishlistPage() {
  const dispatch = useDispatch()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products")
        const products: Product[] = response.data
        setProducts(products)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchProducts()
  }, [])

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromWishlist(id))
  }

  const handleAddToCart = (item: any) => {
    // Extract the product ID from the item.id URL
    const productIdFromUrl = item.id.split("/").pop()

    if (productIdFromUrl) {
      // Find the product in the fetched products array
      const product = products.find((p) => p.product_id === Number(productIdFromUrl))

      if (product) {
        dispatch(
          addItem({
            item: {
              id: item.id,
              title: item.title,
              image_link: item.image_link,
              price: item.price,
              discount: item.discount ?? 0,
              seller_id: item.seller_id,
              units: item.units,
              quantity: 1,
            },
            stock: product.stock, // Use the stock from the fetched product
          }),
        )
      } else {
        console.error("Product not found when adding to cart:", item.id)
      }
    } else {
      console.error("Could not extract product ID from URL:", item.id)
    }
  }

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      // Extract the product ID from the item.id URL
      const productIdFromUrl = item.id.split("/").pop()

      if (productIdFromUrl) {
        // Find the product in the fetched products array
        const product = products.find((p) => p.product_id === Number(productIdFromUrl))

        if (product) {
          dispatch(
            addItem({
              item: {
                id: item.id,
                title: item.title,
                image_link: item.image_link,
                price: item.price,
                discount: item.discount ?? 0,
                seller_id: item.seller_id,
                units: item.units,
                quantity: 1,
              },
              stock: product.stock, // Use the stock from the fetched product
            }),
          )
        } else {
          console.error("Product not found when adding to cart:", item.id)
        }
      } else {
        console.error("Could not extract product ID from URL:", item.id)
      }
    })
  }

  const calculateTotal = () => {
    return wishlistItems.reduce((total, item) => total + item.price, 0).toFixed(2)
  }

  const handleReturnToShop = () => {
    router.push("/")
  }

  return (
    <Card className="flex flex-col relative justify-center max-w-4xl min-h-96 mx-auto p-6">
      <h1 className="absolute top-4 text-2xl font-bold">Your Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-gray-600 text-center">Your wishlist is empty.</p>
      ) : (
        <div className="mt-10 space-y-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-20">
                  <Image
                    src={item.image_link || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                </div>
                <Button
                  variant="outline"
                  className="hover:bg-red-600 hover:text-white"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-green-600 hover:text-white  bg-orange-300"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
          <div className="flex justify-between items-center pt-4 border-t">
           
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold">₹{calculateTotal()}</p>
           
            
          </div>
        </div>
      )}
      <Button variant="outline" onClick={handleReturnToShop} className="mt-4 bg-orange-300 hover:bg-green-600">
        Return to Shop
      </Button>
    </Card>
  )
}
