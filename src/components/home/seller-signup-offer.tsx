"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, TrendingUp, Users, Award } from "lucide-react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function SellerSignupOffer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      // Get current time
      const now = new Date().getTime()

      // Calculate the reference point: start of current 10-day cycle
      // Using epoch time divided by 10 days in milliseconds to get cycle number
      const tenDaysInMs = 10 * 24 * 60 * 60 * 1000
      const cycleNumber = Math.floor(now / tenDaysInMs)
      const cycleStartTime = cycleNumber * tenDaysInMs
      const cycleEndTime = cycleStartTime + tenDaysInMs

      // Calculate time remaining in current cycle
      const difference = cycleEndTime - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Prevent hydration mismatch by not rendering countdown until mounted
  if (!mounted) {
    return (
      <section className="py-4 md:py-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="h-32 md:h-40 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4 md:py-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-green-100">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Content */}
            <div className="p-4 md:p-5 flex flex-col justify-center bg-gradient-to-br from-green-900 to-emerald-800 text-white">
              <div className="mb-3">
                <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-green-900 px-3 py-1 rounded-full text-xs font-bold mb-2 animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>LIMITED TIME OFFER</span>
                </div>

                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">Become a Seller Today!</h2>

                <p className="text-sm md:text-base text-green-50 mb-3 leading-relaxed">
                  <span className="font-semibold text-yellow-300">Offer ending soon!</span> Join free as our esteemed
                  seller and unlock unlimited opportunities to grow your business.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Zero Commission</h4>
                    <p className="text-xs text-green-100">Start selling without any upfront costs</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Reach Millions</h4>
                    <p className="text-xs text-green-100">Access to our vast customer base</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">Premium Support</h4>
                    <p className="text-xs text-green-100">24/7 dedicated seller assistance</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/auth/sign-up?type=seller"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-center text-sm md:text-base"
              >
                Join as Seller Now
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Right Side - Countdown Timer */}
            <div className="p-4 md:p-5 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center mb-3">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Offer Ends In</h3>
                <p className="text-xs md:text-sm text-gray-600">Don't miss this exclusive opportunity!</p>
              </div>

              {/* Countdown Display */}
              <div className="grid grid-cols-4 gap-2 md:gap-3 mb-3">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-green-900 to-emerald-800 rounded-lg md:rounded-xl shadow-lg flex items-center justify-center mb-1 transform transition-all duration-300 hover:scale-105">
                    <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Days
                  </span>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-green-800 to-emerald-700 rounded-lg md:rounded-xl shadow-lg flex items-center justify-center mb-1 transform transition-all duration-300 hover:scale-105">
                    <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Hours
                  </span>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-green-700 to-emerald-600 rounded-lg md:rounded-xl shadow-lg flex items-center justify-center mb-1 transform transition-all duration-300 hover:scale-105">
                    <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Minutes
                  </span>
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square bg-gradient-to-br from-green-600 to-emerald-500 rounded-lg md:rounded-xl shadow-lg flex items-center justify-center mb-1 transform transition-all duration-300 hover:scale-105">
                    <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Seconds
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                <p className="text-xs text-green-800 font-medium">
                  🎉 <span className="font-bold">Free Registration</span> • No Hidden Charges • Instant Approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
