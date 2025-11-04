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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo1.webp"
                alt="IND2B Logo"
                width={80}
                height={80}
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-white">© 2025 One step Ecommerce Solutions</p>
          </div>
          {/* Protocol Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm sm:text-base">IND2B</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/documentation" className="block text-sm text-white hover:text-gray-300 transition-colors">
                About Us
              </Link>
              <Link href="/careers" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Careers
              </Link>
              <Link href="/token-address" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Press
              </Link>
              <Link href="/audit" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Articles
              </Link>
            </div>
          </div>
          {/* About Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm sm:text-base">Support</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/shipping-policy" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Shipping Policy
              </Link>
              <Link href="/refund-policy" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Refund/Return policy
              </Link>
              <Link href="/buyer-protection" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Buyer Protection
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white text-sm sm:text-base">Supplier Tool</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/sell" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Sell on IND2B
              </Link>
              <Link href="/" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Latest Buy
              </Link>
              <Link href="/coinmarketcap" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Learning Centre
              </Link>
              <Link href="/coinmarketcap" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Audit
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white text-sm sm:text-base">Buyer Tool</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/shipping-policy" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Requirements
              </Link>
              <Link href="/" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Products
              </Link>
              <Link href="/coinmarketcap" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Connect Supplier
              </Link>
              <Link href="/coinmarketcap" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Terms
              </Link>
            </div>
          </div>

          {/* Contact Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm sm:text-base">Contact</h3>
            <div className="space-y-2 sm:space-y-3">
              <Link href="/contact-us" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Contact Us
              </Link>
              <Link href="/Help" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Help
              </Link>
              <Link href="/feedback" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Feedback
              </Link>
              <Link href="/partnerships" className="block text-sm text-white hover:text-gray-300 transition-colors">
                Partnerships
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white">
              <span>Crafted With</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#00BFA5]"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span>By I10AI </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              {/* Social Links */}
              <div className="flex gap-3 sm:gap-4">
                <Link
                  href="/linkedin"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link
                  href="/instagram"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link
                  href="/twitter"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="sr-only">X (Twitter)</span>
                </Link>
                <Link
                  href="/facebook"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
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
