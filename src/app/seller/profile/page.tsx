"use client"

import { useState, useEffect, useCallback } from "react"
import { BusinessForm } from "@/components/seller/profiles/business-form"
import { ContactForm } from "@/components/seller/profiles/contact-form"
import { CategoryBrandForm } from "@/components/seller/profiles/category-brand-form"
import { AddressForm } from "@/components/seller/profiles/address-form"
import { BankForm } from "@/components/seller/profiles/bank-form"
import { DocumentForm } from "@/components/seller/profiles/document-form"
import { ProfileSuccess } from "@/components/seller/profiles/profile-success"
import { getProfileData } from "@/actions/profile"
import type { TabType } from "@/types/profile"
import { Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const TAB_ORDER: TabType[] = ["business", "contact", "category", "addresses", "bank", "documents"]

// Properly type the tabs array to ensure value is recognized as TabType
const tabs: { label: string; value: TabType }[] = [
  { label: "Business", value: "business" },
  { label: "Contact", value: "contact" },
  { label: "Category", value: "category" },
  { label: "Address", value: "addresses" },
  { label: "Bank", value: "bank" },
  { label: "Documents", value: "documents" },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("business")
  const [completedSteps, setCompletedSteps] = useState<TabType[]>([])
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  // Track the furthest step the user has reached
  const [furthestStep, setFurthestStep] = useState<number>(0)
  // Add a key to force re-render of forms when tab changes
  const [formKey, setFormKey] = useState(Date.now())

  // Function to check if a tab is completed
  const isTabCompleted = useCallback(
    (tab: TabType) => {
      return completedSteps.includes(tab)
    },
    [completedSteps],
  )

  // Function to check if a tab is enabled (can be clicked)
  const isTabEnabled = useCallback(
    (tab: TabType) => {
      const tabIndex = TAB_ORDER.indexOf(tab)
      return isTabCompleted(tab) || tabIndex <= furthestStep
    },
    [isTabCompleted, furthestStep],
  )

  // Use useCallback to prevent recreation of this function on every render
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getProfileData()
      if (result.success) {
        console.log("Profile data loaded:", result.data)
        setProfileData(result.data)

        // Check if result.data.progress exists before accessing its properties
        if (result.data.progress) {
          const completed = result.data.progress.completedSteps || []
          setCompletedSteps(completed)

          // Set the furthest step based on completed steps
          if (completed.length > 0) {
            const indices = completed.map((step: TabType) => TAB_ORDER.indexOf(step))
            const maxIndex = Math.max(...indices)
            setFurthestStep(Math.max(maxIndex + 1, furthestStep)) // Set to the next step after the furthest completed one
          }

          // Set the active tab based on the current step from the server
          if (result.data.progress.currentStep) {
            setActiveTab(result.data.progress.currentStep)
          }

          // Show success screen if all steps are completed
          if (completed.includes("documents")) {
            setShowSuccess(true)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }, [furthestStep])

  // Update furthestStep when a tab is clicked and refresh data
  const handleTabClick = useCallback(
    async (tab: TabType) => {
      if (isTabEnabled(tab)) {
        try {
          // Refresh data from the server before changing tabs
          await fetchProfileData()

          setActiveTab(tab)
          const tabIndex = TAB_ORDER.indexOf(tab)
          // Update furthestStep if the clicked tab is further than the current furthestStep
          setFurthestStep((prev) => Math.max(prev, tabIndex))

          // Generate a new key to force re-render of the form component
          setFormKey(Date.now())
        } catch (error) {
          console.error("Error changing tabs:", error)
        }
      }
    },
    [isTabEnabled, fetchProfileData],
  )

  // Callback for when a form is successfully saved
  const handleFormSaved = useCallback(async () => {
    // Refresh the data from the server
    await fetchProfileData()

    // After refreshing data, the activeTab should be updated to the next tab
    // based on the server's currentStep value, which was updated in the server action

    // Generate a new key to force re-render of the form component
    setFormKey(Date.now())
  }, [fetchProfileData])

  // Fetch data on initial mount
  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  // Memoize renderForm to prevent unnecessary re-renders
  const renderForm = useCallback(() => {
    if (!profileData) return null

    console.log("Rendering form for tab:", activeTab)
    console.log("Profile data for this tab:", profileData[activeTab])

    switch (activeTab) {
      case "business":
        return <BusinessForm key={`business-${formKey}`} initialData={profileData.business} onSaved={handleFormSaved} />
      case "contact":
        return <ContactForm key={`contact-${formKey}`} initialData={profileData.contact} onSaved={handleFormSaved} />
      case "category":
        return (
          <CategoryBrandForm key={`category-${formKey}`} initialData={profileData.category} onSaved={handleFormSaved} />
        )
      case "addresses":
        return <AddressForm key={`addresses-${formKey}`} initialData={profileData.address} onSaved={handleFormSaved} />
      case "bank":
        return <BankForm key={`bank-${formKey}`} initialData={profileData.bank} onSaved={handleFormSaved} />
      case "documents":
        return (
          <DocumentForm
            key={`documents-${formKey}`}
            initialData={profileData.document}
            onSuccess={() => {
              setShowSuccess(true)
              handleFormSaved()
            }}
          />
        )
      default:
        return null
    }
  }, [activeTab, profileData, formKey, handleFormSaved])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (showSuccess) {
    return <ProfileSuccess />
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Management</h1>
        <p className="text-muted-foreground">Update your business and personal information here.</p>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-2 md:space-x-4 border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              disabled={!isTabEnabled(tab.value)}
              className={cn(
                "px-3 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                "border-b-2 -mb-px flex items-center gap-1",
                activeTab === tab.value ? "border-orange-600 text-orange-600" : "border-transparent",
                isTabEnabled(tab.value)
                  ? "hover:text-orange-600 text-muted-foreground"
                  : "opacity-50 cursor-not-allowed text-muted-foreground",
                isTabCompleted(tab.value) ? "text-green-600" : "",
              )}
            >
              {isTabCompleted(tab.value) && <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-2xl">{renderForm()}</div>
    </div>
  )
}
