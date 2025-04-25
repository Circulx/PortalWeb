"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store"
import { removeItem } from "@/store/slices/cartSlice"

export default function CartPage() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state: RootState) => state.cart.items)

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id))
  }

  return (
    <Card className="flex flex-col relative justify-center max-w-4xl min-h-96 mx-auto p-6">
      <h1 className="absolute top-4 text-2xl font-bold">My Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-center">Your cart is empty.</p>
      ) : (
        <div className="mt-10 space-y-4">
          {cartItems.map((item) => (
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
                  <p className="text-gray-600">
                    ₹{item.price.toFixed(2)} x {item.quantity}
                  </p>
                  <p className="text-gray-600 font-medium">Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {item.stock} {item.stock === 1 ? "unit" : "units"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="hover:bg-red-600 hover:text-white"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold">₹{calculateTotal()}</p>
            </div>
            <Button className="bg-green-700 hover:bg-orange-500">Proceed to Checkout</Button>
          </div>
        </div>
      )}
    </Card>
  )
}
