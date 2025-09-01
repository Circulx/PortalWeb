import type { TabType } from "@/types/profile"

export function ProfileSuccess() {
  // Define all tabs as completed
  const tabs: { label: string; value: TabType }[] = [
    { label: "Business", value: "business" },
    { label: "Contact", value: "contact" },
    { label: "Category", value: "category" },
    { label: "Address", value: "addresses" },
    { label: "Bank", value: "bank" },
    { label: "Documents", value: "documents" },
  ]

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

      {/*
      <div className="mb-6 sm:mb-8">
        <nav className="flex space-x-1 sm:space-x-2 md:space-x-4 border-b overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className={cn(
                "px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                "border-b-2 -mb-px flex items-center gap-1",
                "border-transparent",
                "text-green-600",
              )}
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              {tab.label}
            </div>
          ))}
        </nav>
      </div>
*/}

      {/* Success message - Responsive padding and text size */}
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-gray-50 rounded-lg shadow-sm my-4 sm:my-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-orange-600 max-w-3xl">
          Congratulations,Your profile has been submitted successfully and is now under review!
        </h2>
      </div>
    </div>
  )
}
