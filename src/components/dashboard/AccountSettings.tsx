"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Country, State } from "country-state-city"
import { User } from "lucide-react"
import { CountryStateSelect } from "./CountryStateSelect"

// Function to resize image to reduce file size
const resizeImage = (file: File, maxWidth = 200, maxHeight = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Get the resized image as base64 string
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6) // Use JPEG with 60% quality for smaller size
        resolve(dataUrl)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    secondaryEmail: "",
    phoneNumber: "",
    country: "",
    state: "",
    zipCode: "",
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [isFormValid, setIsFormValid] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Track editing state
  const [imageVersion, setImageVersion] = useState(0) // For forcing image refresh

  useEffect(() => {
    setCountries(Country.getAllCountries())
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      // Add a timestamp to prevent caching
      const response = await fetch(`/api/users/account-details?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Fetched user data fields:", Object.keys(data)) // Debug log

      setFormData({
        fullName: data.name || "",
        email: data.email || "",
        secondaryEmail: data.secondaryEmail || "",
        phoneNumber: data.phoneNumber || "",
        country: data.country || "",
        state: data.state || "",
        zipCode: data.zipCode || "",
      })

      // Set profile image and log for debugging
      console.log("Profile image exists:", !!data.profileImage)
      if (data.profileImage) {
        console.log("Profile image length:", data.profileImage.length)
        setProfileImage(data.profileImage)
        setImageVersion((prev) => prev + 1) // Increment to force refresh
      } else {
        setProfileImage(null)
      }

      if (data.country) {
        const selectedCountry = countries.find((country) => country.isoCode === data.country)
        if (selectedCountry) {
          setStates(State.getStatesOfCountry(selectedCountry.isoCode))
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data. Please refresh the page and try again.")
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = useCallback((email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }, [])

  const validateForm = useCallback(() => {
    const requiredFields = ["fullName", "email", "country", "state", "zipCode"]
    const isValid =
      requiredFields.every((field) => formData[field as keyof typeof formData] !== "") && validateEmail(formData.email)
    setIsFormValid(isValid)
  }, [formData, validateEmail])

  useEffect(() => {
    validateForm()
  }, [validateForm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value: string) => {
    const selectedCountry = countries.find((country) => country.isoCode === value)
    setFormData((prev) => ({ ...prev, country: value, state: "" }))
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry.isoCode))
    } else {
      setStates([])
    }
  }

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, state: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Show loading state
        setLoading(true)
        setError(null)

        // Check file size before processing
        if (file.size > 5 * 1024 * 1024) {
          // 5MB
          setError("Image is too large. Please select an image smaller than 5MB.")
          setLoading(false)
          return
        }

        // Resize and compress the image
        const resizedImage = await resizeImage(file, 200, 200)
        console.log("Resized image length:", resizedImage.length)

        setProfileImage(resizedImage)
        setImageVersion((prev) => prev + 1) // Increment to force refresh
      } catch (err) {
        console.error("Error processing image:", err)
        setError("Failed to process image. Please try a different image.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      // Create the data object including the profile image
      const dataToSend = {
        fullName: formData.fullName,
        email: formData.email,
        secondaryEmail: formData.secondaryEmail || "",
        phoneNumber: formData.phoneNumber || "",
        country: formData.country,
        state: formData.state,
        zipCode: formData.zipCode,
        profileImage: profileImage,
      }

      console.log("Sending data to API, image included:", !!profileImage) // Debug log
      if (profileImage) {
        console.log("Image size being sent:", profileImage.length)
      }

      const response = await fetch("/api/users/account-details", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Error response:", data)
        setError(data.error || "Failed to update profile.")
        if (data.details) {
          console.error("Error details:", data.details)
        }
      } else {
        setMessage(data.message || "Profile updated successfully.")
        console.log("Update response:", data)

        // Show specific message about profile image
        if (profileImage && !data.profileImageSaved) {
          setMessage((prev) => `${prev} Note: There was an issue saving your profile image.`)
        }

        setIsEditing(false)

        // Wait a moment before refreshing the data
        setTimeout(() => {
          fetchUserData()
        }, 1000)
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
        {/* Profile Image Section */}
        <div className="text-center">
          <div className="relative w-40 h-40 mx-auto mb-4">
            {profileImage ? (
              // Use a regular img tag instead of Next.js Image component
              <img
                src={profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-emerald-900"
                style={{ width: "100%", height: "100%" }}
                key={`profile-image-${imageVersion}`} // Force refresh when image changes
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-emerald-900">
                <User className="w-20 h-20 text-gray-400" />
              </div>
            )}

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={!isEditing || loading}
          />
          <Button
            variant="outline"
            className="w-full hover:bg-orange-500 hover:text-white"
            onClick={() => document.getElementById("profileImage")?.click()}
            disabled={!isEditing || loading}
          >
            Change Photo
          </Button>
          {profileImage && isEditing && (
            <Button
              variant="outline"
              className="w-full mt-2 hover:bg-red-500 hover:text-white"
              onClick={() => {
                setProfileImage(null)
                setImageVersion((prev) => prev + 1)
              }}
              disabled={loading}
            >
              Remove Photo
            </Button>
          )}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={!isEditing || loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryEmail">Secondary Email</Label>
              <Input
                id="secondaryEmail"
                name="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country/Region <span className="text-orange-500">*</span>
              </Label>
              <CountryStateSelect
                selectedCountry={formData.country}
                selectedState={formData.state}
                onCountryChange={(value) => {
                  setFormData((prev) => ({ ...prev, country: value, state: "" }))
                }}
                onStateChange={(value) => {
                  setFormData((prev) => ({ ...prev, state: value }))
                }}
                label="country"
                
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">
                Zip Code <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                required
              />
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-emerald-900 hover:bg-orange-500 text-white"
              disabled={!isEditing || !isFormValid || loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white"
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
