"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const slides = [
  {
    id: 1,
    title: "Delivery Within",
    subtitle: "24 HOURS",
    description: "At No Extra Cost",
    image: "/OIP.jpg",
  },
  {
    id: 2,
    title: "Special Offers",
    subtitle: "UP TO 50% OFF",
    description: "Limited Time Only",
    image: "/th.jpg",
  },
  {
    id: 3,
    title: "New Arrivals",
    subtitle: "SHOP NOW",
    description: "Fresh Stock Available",
    image: "/OIP.jpg",
  },
]

export default function SimpleSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden bg-blue-100">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="container mx-auto px-4 h-full flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/2 text-center sm:text-left mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">{slide.title}</h2>
              <div className="text-3xl sm:text-6xl font-bold mb-4">{slide.subtitle}</div>
              <p className="text-lg sm:text-xl">👍 {slide.description}</p>
            </div>
            <div className="w-full sm:w-1/2">
              <Image src={slide.image} alt={slide.title} width={800} height={400} className="object-contain" />
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${currentSlide === index ? "bg-[#004D40]" : "bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  )
}
