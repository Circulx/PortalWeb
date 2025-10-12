"use client"

import { useState } from "react"
import { Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type CareerType = "full-time" | "part-time" | "internship" | "contract"

interface Career {
  _id: string
  title: string
  type: CareerType
  location: string
  isRemote: boolean
  description: string
  responsibilities: string[]
  requirements: string[]
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  applyUrl?: string
  applyEmail?: string
  applicationDeadline?: string
  createdAt: string
}

interface CareerFiltersProps {
  careers: Career[]
}

export default function CareerFilters({ careers }: CareerFiltersProps) {
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredCareers = selectedType === "all" ? careers : careers.filter((c) => c.type === selectedType)

  const formatSalary = (min?: number, max?: number, currency = "INR") => {
    if (!min && !max) return null
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    })
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
    if (min) return `From ${formatter.format(min)}`
    if (max) return `Up to ${formatter.format(max)}`
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTypeColor = (type: CareerType) => {
    switch (type) {
      case "full-time":
        return "bg-blue-100 text-blue-800"
      case "part-time":
        return "bg-green-100 text-green-800"
      case "internship":
        return "bg-purple-100 text-purple-800"
      case "contract":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      {/* Filter Buttons */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
            className="rounded-full"
          >
            All Positions
          </Button>
          <Button
            variant={selectedType === "full-time" ? "default" : "outline"}
            onClick={() => setSelectedType("full-time")}
            className="rounded-full"
          >
            Full-time
          </Button>
          <Button
            variant={selectedType === "part-time" ? "default" : "outline"}
            onClick={() => setSelectedType("part-time")}
            className="rounded-full"
          >
            Part-time
          </Button>
          <Button
            variant={selectedType === "internship" ? "default" : "outline"}
            onClick={() => setSelectedType("internship")}
            className="rounded-full"
          >
            Internship
          </Button>
          <Button
            variant={selectedType === "contract" ? "default" : "outline"}
            onClick={() => setSelectedType("contract")}
            className="rounded-full"
          >
            Contract
          </Button>
        </div>
      </div>

      {/* Careers Listing */}
      <div className="container mx-auto px-4 pb-16">
        {filteredCareers.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No positions available</h3>
            <p className="text-gray-600">
              {selectedType === "all"
                ? "Check back soon for new opportunities!"
                : `No ${selectedType.replace("-", " ")} positions available at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 max-w-5xl mx-auto">
            {filteredCareers.map((career) => (
              <Card key={career._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <Briefcase className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                        <div>
                          <CardTitle className="text-2xl mb-2">{career.title}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getTypeColor(career.type)}>{career.type.replace("-", " ")}</Badge>
                            {career.isRemote && <Badge variant="outline">Remote</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{career.location}</span>
                    </div>
                    {formatSalary(career.salaryMin, career.salaryMax, career.salaryCurrency) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span>{formatSalary(career.salaryMin, career.salaryMax, career.salaryCurrency)}</span>
                      </div>
                    )}
                    {career.applicationDeadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Apply by {formatDate(career.applicationDeadline)}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-2">About the Role</h4>
                    <p className="text-gray-700 leading-relaxed">{career.description}</p>
                  </div>

                  {/* Responsibilities */}
                  {career.responsibilities && career.responsibilities.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Responsibilities</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {career.responsibilities.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {career.requirements && career.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {career.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Apply Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {career.applyUrl && (
                      <Button asChild className="flex-1 sm:flex-none">
                        <a href={career.applyUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Apply Online
                        </a>
                      </Button>
                    )}
                    {career.applyEmail && (
                      <Button asChild variant="outline" className="flex-1 sm:flex-none bg-transparent">
                        <a href={`mailto:${career.applyEmail}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Email Application
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
