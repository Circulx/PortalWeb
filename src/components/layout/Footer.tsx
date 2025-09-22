"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    try {
      const response = await fetch("api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Network response is not ok.")
      }
      const data = response.json()
    } catch (error) {
      setError("There was a problem subscribing to the newsletter. Please try again after sometime.")
    }
  }

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo1.webp"
                alt="IND2B Logo"
                width={80}
                height={80}
                className="w-24 h-24 object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-white">© 2025 One step Ecommerce Solutions</p>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <div className="space-y-3">
              <Link href="/shipping-policy" className="block text-white hover:text-gray-300">
                Shipping Policy
              </Link>
              <Link href="/refund-policy" className="block text-white hover:text-gray-300">
                Refund/Return policy
              </Link>
              <Link href="/coinmarketcap" className="block text-white hover:text-gray-300">
                Buyer Protection
              </Link>
            </div>
          </div>

          {/* Protocol Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Supplier Tool</h3>
            <div className="space-y-3">
              <Link href="/documentation" className="block text-white hover:text-gray-300">
                Sell
              </Link>
              <Link href="/medium" className="block text-white hover:text-gray-300">
                Latest Buy
              </Link>
              <Link href="/token-address" className="block text-white hover:text-gray-300">
                Learning Centre
              </Link>
              <Link href="/audit" className="block text-white hover:text-gray-300">
                Audit
              </Link>
            </div>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Buyer Tool</h3>
            <div className="space-y-3">
              <Link href="/getting-started" className="block text-white hover:text-gray-300">
                Requirements
              </Link>
              <Link href="/faq" className="block text-white hover:text-gray-300">
                Products
              </Link>
              <Link href="/privacy" className="block text-white hover:text-gray-300">
                Connect Supplier
              </Link>
              <Link href="/terms" className="block text-white hover:text-gray-300">
                Terms
              </Link>
            </div>
          </div>

          {/* Contact Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-3">
              <Link href="/contact-us" className="block text-white hover:text-gray-300">
                Contact Us
              </Link>
              <Link href="/Help" className="block text-white hover:text-gray-300">
                Help
              </Link>
              <Link href="/feedback" className="block text-white hover:text-gray-300">
                Feedback
              </Link>
              <Link href="/partnerships" className="block text-white hover:text-gray-300">
                Partnerships
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 text-sm text-white">
              <span>Crafted With</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#00BFA5]"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span>By I10AI </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Social Links */}
              <div className="flex gap-4">
                <Link href="/twitter" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="/discord" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                  <span className="sr-only">Discord</span>
                </Link>
                <Link href="/linkedin" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link href="/telegram" className="text-white hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  <span className="sr-only">Telegram</span>
                </Link>
              </div>

              {/* Subscribe Form */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
