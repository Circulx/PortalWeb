"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, Building2, User, MapPin, CreditCard, FileImage, Loader2 } from "lucide-react"
import type { TabType } from "@/types/profile"

export function ProfileSuccess() {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Define all tabs as completed
  const tabs: { label: string; value: TabType }[] = [
    { label: "Business", value: "business" },
    { label: "Contact", value: "contact" },
    { label: "Category", value: "category" },
    { label: "Address", value: "addresses" },
    { label: "Bank", value: "bank" },
    { label: "Documents", value: "documents" },
  ]

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        console.log("Fetching profile data from API...")
        
        const response = await fetch("/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log("API response:", result)
        
        if (result.success) {
          console.log("Profile data loaded:", result.data)
          setProfileData(result.data)
        } else {
          console.error("API returned error:", result.error)
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  const renderBusinessDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Business Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Legal Entity Name</p>
            <p className="text-sm">{profileData?.business?.legalEntityName || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Trade Name</p>
            <p className="text-sm">{profileData?.business?.tradeName || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">GSTIN</p>
            <p className="text-sm font-mono">{profileData?.business?.gstin || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Business Entity Type</p>
            <p className="text-sm">{profileData?.business?.businessEntityType || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Country</p>
            <p className="text-sm">{profileData?.business?.country || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">State</p>
            <p className="text-sm">{profileData?.business?.state || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">City</p>
            <p className="text-sm">{profileData?.business?.city || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Pincode</p>
            <p className="text-sm">{profileData?.business?.pincode || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContactDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">Contact Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
            <p className="text-sm">{profileData?.contact?.contactName || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Email ID</p>
            <p className="text-sm">{profileData?.contact?.emailId || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
            <p className="text-sm">{profileData?.contact?.phoneNumber || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Preferred Pickup Time</p>
            <p className="text-sm">{profileData?.contact?.pickupTime || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCategoryDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">Category & Brand Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Selected Categories</p>
          {profileData?.category?.categories && profileData.category.categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {profileData.category.categories.map((category: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No categories selected</p>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Authorized Brands</p>
          {profileData?.category?.authorizedBrands && profileData.category.authorizedBrands.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {profileData.category.authorizedBrands.map((brand: string, index: number) => (
                <Badge key={index} variant="outline">
                  {brand}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No brands selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderAddressDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg">Address Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Billing Address</p>
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <p className="text-sm">
              {profileData?.address?.billingAddress?.addressLine1 || "Not provided"}
            </p>
            {profileData?.address?.billingAddress?.addressLine2 && (
              <p className="text-sm">{profileData.address.billingAddress.addressLine2}</p>
            )}
            <p className="text-sm">
              {profileData?.address?.billingAddress?.city && profileData?.address?.billingAddress?.state && (
                `${profileData.address.billingAddress.city}, ${profileData.address.billingAddress.state}`
              )}
            </p>
            <p className="text-sm">
              {profileData?.address?.billingAddress?.phoneNumber && (
                `Phone: ${profileData.address.billingAddress.phoneNumber}`
              )}
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Pickup Address</p>
          <div className="bg-gray-50 p-3 rounded-md text-center">
            <p className="text-sm">
              {profileData?.address?.pickupAddress?.addressLine1 || "Not provided"}
            </p>
            {profileData?.address?.pickupAddress?.addressLine2 && (
              <p className="text-sm">{profileData.address.pickupAddress.addressLine2}</p>
            )}
            <p className="text-sm">
              {profileData?.address?.pickupAddress?.city && profileData?.address?.pickupAddress?.state && (
                `${profileData.address.pickupAddress.city}, ${profileData.address.pickupAddress.state}`
              )}
            </p>
            <p className="text-sm">
              {profileData?.address?.pickupAddress?.phoneNumber && (
                `Phone: ${profileData.address.pickupAddress.phoneNumber}`
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderBankDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg">Bank Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Account Holder Name</p>
            <p className="text-sm">{profileData?.bank?.accountHolderName || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Account Number</p>
            <p className="text-sm font-mono">{profileData?.bank?.accountNumber || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
            <p className="text-sm">{profileData?.bank?.bankName || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">IFSC Code</p>
            <p className="text-sm font-mono">{profileData?.bank?.ifscCode || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Branch</p>
            <p className="text-sm">{profileData?.bank?.branch || "Not provided"}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Account Type</p>
            <p className="text-sm">{profileData?.bank?.accountType || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderDocumentDetails = () => (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <FileImage className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-lg">Document Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">PAN Card</p>
            <p className="text-sm">
              {profileData?.document?.panCardUrl && 
               profileData.document.panCardUrl !== "placeholder-pancard-url" &&
               profileData.document.panCardUrl !== "pancard-uploaded-placeholder" ? (
                <span className="text-green-600">✓ Uploaded</span>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Aadhar Card</p>
            <p className="text-sm">
              {profileData?.document?.aadharCardUrl && 
               profileData.document.aadharCardUrl !== "placeholder-aadharcard-url" &&
               profileData.document.aadharCardUrl !== "aadharcard-uploaded-placeholder" ? (
                <span className="text-green-600">✓ Uploaded</span>
              ) : (
                "Not provided"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
      {/* Header - Responsive text sizes */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Profile Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Update your business and personal information here.
        </p>
      </div>

      {/* Progress Percentage Bar - Responsive spacing */}
      <div className="w-full mb-6 sm:mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium">Profile Completion</span>
          <span className="text-xs sm:text-sm font-medium">100%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
          <div
            className="bg-green-900 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: "100%" }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          {tabs.map((tab, index) => (
            <div key={tab.value} className="flex flex-col items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-900"></div>
              <span className="text-[10px] sm:text-xs mt-1 hidden sm:block md:block">
                {/* Show abbreviated labels on small screens */}
                {window.innerWidth < 640 && index > 0 && index < tabs.length - 1
                  ? tab.label.substring(0, 1)
                  : tab.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Success message - Responsive padding and text size */}
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-gray-50 rounded-lg shadow-sm my-4 sm:my-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-orange-600 max-w-3xl">
          Congratulations, Your profile has been submitted successfully and is now under review!
        </h2>
      </div>

      {/* Profile Data Display - Exactly Centered */}
      <div className="flex justify-center items-center">
        <div className="w-full max-w-3xl space-y-6">
          <h3 className="text-xl font-semibold text-center mb-6">Your Submitted Profile Information</h3>
          {renderBusinessDetails()}
          {renderContactDetails()}
          {renderCategoryDetails()}
          {renderAddressDetails()}
          {renderBankDetails()}
          {renderDocumentDetails()}
        </div>
      </div>
    </div>
  )
}
