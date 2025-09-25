"use client"

import React from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Package, CheckCircle, UserPlus, Building2, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"

const SellPage = () => {

  return (
   <div className="min-h-screen flex flex-col gap-8 bg-white">
    <div className="container mx-auto px-4">
    <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto">
      <div className="w-1/3 flex justify-center">
        <img 
          src="/sell.jpg" 
          alt="Person" 
          className="h-64 object-contain"
        />
      </div>
       {/* Middle: Text + Stats */}
      <div className="text-center">
        <h2 className="text-lg font-bold mb-6">
        Join millions of suppliers and buyers on India’s trusted B2B network.
        </h2>

        <div className="flex justify-around">
          {/* Buyers */}
          <div>
            <div className="text-blue-600 text-4xl">📈</div>
            <h3 className="font-semibold">20.6 crore+</h3>
            <p className="text-gray-600">Buyers</p>
          </div>

          {/* Suppliers */}
          <div>
            <div className="text-blue-600 text-4xl">₹</div>
            <h3 className="font-semibold">82 lakh+</h3>
            <p className="text-gray-600">Suppliers</p>
          </div>

          {/* Products */}
          <div>
            <div className="text-blue-600 text-4xl">📦</div>
            <h3 className="font-semibold">11.5 crore+</h3>
            <p className="text-gray-600">Products & Services</p>
          </div>
        </div>
      </div>
      {/* Right: Join as Seller Button */}
      <div className="w-1/3 flex items-center justify-center">
        <div className="text-center">
          <Link href="/seller">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              size="lg"
            >
              Join as a Seller
            </Button>
          </Link>
          <p className="text-gray-600 mt-4 text-sm">
            Start your selling journey today
          </p>
        </div>
      </div>
    </div>

    <div className="flex justify-center items-start gap-6 max-w-6xl mx-auto">
        {/* Left Column - Benefits */}
      <div className="w-1/2 p-8 ">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sell on IND2B</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grow your Business</h3>
              <p className="text-gray-600">Sell to buyers anytime, anywhere across India</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero Cost</h3>
              <p className="text-gray-600">No commission or transaction fees</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage your Business Better</h3>
              <p className="text-gray-600">Advanced dashboard and lead management system</p>
            </div>
          </div>
        </div>
      </div>

        {/* Right Column - Steps */}
      <div className="w-1/2 p-8 ">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Get a free listing in 3 simple steps:</h2>
        
        <div className="flex justify-between items-start space-x-8">
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg text-left font-semibold text-gray-900 mb-2">Create Account</h3>
            <p className="text-gray-600 text-left">Add your name and phone number to get started</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg text-left font-semibold text-gray-900 mb-2">Add Business</h3>
            <p className="text-gray-600 text-left">Add name, address & email of your company, store or business</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-4">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-lg text-left font-semibold text-gray-900 mb-2">Add Products</h3>
            <p className="text-gray-600 text-left">Minimum 3 products/services needed for your free listing page</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>

    
  )
}

export default SellPage;
