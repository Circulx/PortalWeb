"use client"

interface Product {
  _id: string
  product_id: number
  title: string
  SKU: string
  price: number
  seller_name?: string
  location?: string
  seller_gstin?: string
}

interface ReviewData {
  averageRating: number
  totalReviews: number
}

interface SellerInformationSectionProps {
  product: Product
  reviewData: ReviewData
}

export default function SellerInformationSection({ product, reviewData }: SellerInformationSectionProps) {

  return (
    <>
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Company Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company Logo Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {(product.seller_name || "AB").charAt(0).toUpperCase()}
          </div>
          
          {/* Company Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {product.seller_name || "AB Industrial Supplies"}
            </h3>
            <p className="text-gray-600 mb-1">{product.location || "Singapore"}</p>
            {product.seller_gstin ? (
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">GST:</span> {product.seller_gstin}
              </p>
            ) : (
              <p className="text-sm text-gray-400 mb-2">
                <span className="font-medium">GST:</span> Not provided
              </p>
            )}
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(reviewData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {reviewData.averageRating}/5 ({reviewData.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            TrustSEAL Verified
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Leading Supplier
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Verified Exporter
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
            </svg>
            Manufacturer
          </span>
        </div>

        {/* Contact Options */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* View Mobile Number Button */}
            <button 
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              View Mobile Number
            </button>
            
            {/* Contact Supplier Button */}
            <button 
              className="flex items-center justify-center px-6 py-2 border-2 border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Contact Supplier
            </button>
          </div>
          
          {/* Response Rate */}
          <p className="text-sm text-gray-500 mt-2 text-center">
            86% Response Rate
          </p>
        </div>
      </div>
    </>
  )
}
