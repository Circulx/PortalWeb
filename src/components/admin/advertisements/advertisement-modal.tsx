"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface Advertisement {
  _id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  order: number
  deviceType: "all" | "desktop" | "mobile" | "tablet"
  startDate?: string
  endDate?: string
}

interface AdvertisementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  advertisement?: Advertisement | null
}

export function AdvertisementModal({ isOpen, onClose, onSuccess, advertisement }: AdvertisementModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    order: 0,
    deviceType: "all" as "all" | "desktop" | "mobile" | "tablet",
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        subtitle: advertisement.subtitle,
        description: advertisement.description || "",
        imageUrl: advertisement.imageUrl,
        linkUrl: advertisement.linkUrl || "",
        isActive: advertisement.isActive,
        order: advertisement.order,
        deviceType: advertisement.deviceType,
        startDate: advertisement.startDate ? advertisement.startDate.split("T")[0] : "",
        endDate: advertisement.endDate ? advertisement.endDate.split("T")[0] : "",
      })
      setImagePreview(advertisement.imageUrl)
    } else {
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        isActive: true,
        order: 0,
        deviceType: "all",
        startDate: "",
        endDate: "",
      })
      setImagePreview("")
    }
  }, [advertisement])

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true)

      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      // You can implement your own image upload logic here
      // For now, we'll use a placeholder URL
      const imageUrl = URL.createObjectURL(file)

      setFormData((prev) => ({ ...prev, imageUrl }))
      setImagePreview(imageUrl)

      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.subtitle || !formData.imageUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      const url = advertisement ? `/api/admin/advertisements/${advertisement._id}` : "/api/admin/advertisements"

      const method = advertisement ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        onSuccess()
      } else {
        toast.error(result.error || "Failed to save advertisement")
      }
    } catch (error) {
      console.error("Error saving advertisement:", error)
      toast.error("Error saving advertisement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{advertisement ? "Edit Advertisement" : "Create Advertisement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Advertisement Image *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("")
                      setFormData((prev) => ({ ...prev, imageUrl: "" }))
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload an image</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
            <div className="mt-2">
              <Label htmlFor="imageUrl">Or enter image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                  setImagePreview(e.target.value)
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., New Arrivals"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle *</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="e.g., SHOP NOW"
                maxLength={150}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Fresh Stock Available"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
              placeholder="https://example.com/products"
              type="url"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <select
                id="deviceType"
                value={formData.deviceType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deviceType: e.target.value as "all" | "desktop" | "mobile" | "tablet",
                  }))
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop Only</option>
                <option value="tablet">Tablet Only</option>
                <option value="mobile">Mobile Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: Number.parseInt(e.target.value) || 0 }))}
                min={0}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <span className="text-sm">{formData.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : advertisement ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
