"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { Country, State } from "country-state-city"
import { CountryStateSelect } from "./CountryStateSelect"

interface Address {
  id: string;
  type: "Billing" | "Shipping";
  firstName: string;
  lastName: string;
  companyName?: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  email: string;
  phone: string;
}

export default function AddressPage() {
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [countries, setCountries] = useState(Country.getAllCountries())
  const [states, setStates] = useState<any[]>([])
  const [formData, setFormData] = useState({
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingAddress: "",
    billingCountry: "",
    billingState: "",
    billingCity: "",
    billingZip: "",
    billingEmail: "",
    billingPhone: "",
    shippingFirstName: "",
    shippingLastName: "",
    shippingCompany: "",
    shippingAddress: "",
    shippingCountry: "",
    shippingState: "",
    shippingCity: "",
    shippingZip: "",
    shippingEmail: "",
    shippingPhone: "",
  })

    // Fetch saved addresses from the database
    useEffect(() => {
      const fetchAddresses = async () => {
        try {
          const response = await fetch("/api/addresses", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch addresses");
          }
  
          const data = await response.json();
  
          if (data) {
            const billingAddress: Address = {
              id: `billing-${Date.now()}`,
              type: "Billing",
              ...data.billingAddress,
            };
  
            const shippingAddress: Address = {
              id: `shipping-${Date.now()}`,
              type: "Shipping",
              ...data.shippingAddress,
            };
  
            setAddresses([billingAddress, shippingAddress]);
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }
      };
  
      fetchAddresses();
    }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (value: string, type: "billing" | "shipping") => {
    const selectedCountry = countries.find((country) => country.isoCode === value)
    setFormData((prev) => ({
      ...prev,
      [`${type}Country`]: value,
      [`${type}State`]: "",
    }))
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry.isoCode))
    } else {
      setStates([])
    }
  }

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((address) => address.id !== id))
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()

    // Create new addresses from form data
    
    const billingAddress: Omit<Address, "id" | "type"> = {
        firstName: formData.billingFirstName,
        lastName: formData.billingLastName,
        companyName: formData.billingCompany,
        address: formData.billingAddress,
        country: formData.billingCountry,
        state: formData.billingState,
        city: formData.billingCity,
        zipCode: formData.billingZip,
        email: formData.billingEmail,
        phone: formData.billingPhone,
      };
      const shippingAddress: Omit<Address, "id" | "type"> = {
        firstName: formData.shippingFirstName,
        lastName: formData.shippingLastName,
        companyName: formData.shippingCompany,
        address: formData.shippingAddress,
        country: formData.shippingCountry,
        state: formData.shippingState,
        city: formData.shippingCity,
        zipCode: formData.shippingZip,
        email: formData.shippingEmail,
        phone: formData.shippingPhone,
      };
    

    try {
      // Send POST request to the API
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingAddress,
          shippingAddress
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save addresses");
      }

      const result = await response.json();    
      const savedId = result.data._id;

      setAddresses((prev) => [
        ...prev,
        { id: `billing-${Date.now()}`, type: "Billing", ...billingAddress },
        { id: `shipping-${Date.now()}`, type: "Shipping", ...shippingAddress },
      ]);    
    } catch (error) {
      console.error("Error saving addresses:", error);
    }

    setShowAddressForm(false);
    // Reset form data
    setFormData({
      billingFirstName: "",
      billingLastName: "",
      billingCompany: "",
      billingAddress: "",
      billingCountry: "",
      billingState: "",
      billingCity: "",
      billingZip: "",
      billingEmail: "",
      billingPhone: "",
      shippingFirstName: "",
      shippingLastName: "",
      shippingCompany: "",
      shippingAddress: "",
      shippingCountry: "",
      shippingState: "",
      shippingCity: "",
      shippingZip: "",
      shippingEmail: "",
      shippingPhone: "",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <Button className="bg-emerald-900 hover:bg-orange-500" onClick={() => setShowAddressForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </Button>
        </div>

        {addresses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <Card key={address.id} className="p-4">
                <h3 className="font-semibold mb-2">{address.type}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {address.firstName} {address.lastName}
                  <br />
                  {address.address}
                  <br />
                  {address.city}, {address.state} {address.zipCode}
                  <br />
                  {countries.find((c) => c.isoCode === address.country)?.name}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="hover:bg-orange-500 hover:text-white"
                    onClick={() => {
                      // Handle edit functionality
                      console.log("Edit address:", address)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="hover:bg-orange-500 hover:text-white"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {showAddressForm && (
        <Card className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Add New Address</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowAddressForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
            {/* Billing Address */}
            <div className="space-y-4">
              <div className="bg-emerald-900 text-white px-4 py-2">
                <h3 className="font-semibold">BILLING ADDRESS</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingFirstName">First Name</Label>
                  <Input
                    id="billingFirstName"
                    name="billingFirstName"
                    value={formData.billingFirstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingLastName">Last Name</Label>
                  <Input
                    id="billingLastName"
                    name="billingLastName"
                    value={formData.billingLastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCompany">Company Name (Optional)</Label>
                <Input
                  id="billingCompany"
                  name="billingCompany"
                  value={formData.billingCompany}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Address</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCountry">Country</Label>
                <CountryStateSelect
                  selectedCountry={formData.billingCountry}
                  selectedState={formData.billingState}
                  onCountryChange={(value) => handleCountryChange(value, "billing")}
                  onStateChange={(value) => {
                    setFormData((prev) => ({ ...prev, billingState: value }))
                  }}
                  label="country"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCity">City</Label>
                  <Input
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingZip">Zip Code</Label>
                  <Input
                    id="billingZip"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Email</Label>
                <Input
                  id="billingEmail"
                  name="billingEmail"
                  type="email"
                  value={formData.billingEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPhone">Phone Number</Label>
                <Input
                  id="billingPhone"
                  name="billingPhone"
                  value={formData.billingPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <div className="bg-emerald-900 text-white px-4 py-2">
                <h3 className="font-semibold">SHIPPING ADDRESS</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingFirstName">First Name</Label>
                  <Input
                    id="shippingFirstName"
                    name="shippingFirstName"
                    value={formData.shippingFirstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingLastName">Last Name</Label>
                  <Input
                    id="shippingLastName"
                    name="shippingLastName"
                    value={formData.shippingLastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCompany">Company Name (Optional)</Label>
                <Input
                  id="shippingCompany"
                  name="shippingCompany"
                  value={formData.shippingCompany}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Address</Label>
                <Input
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCountry">Country</Label>
                <CountryStateSelect
                  selectedCountry={formData.shippingCountry}
                  selectedState={formData.shippingState}
                  onCountryChange={(value) => handleCountryChange(value, "shipping")}
                  onStateChange={(value) => {
                    setFormData((prev) => ({ ...prev, shippingState: value }))
                  }}
                  label="country"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCity">City</Label>
                  <Input
                    id="shippingCity"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingZip">Zip Code</Label>
                  <Input
                    id="shippingZip"
                    name="shippingZip"
                    value={formData.shippingZip}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingEmail">Email</Label>
                <Input
                  id="shippingEmail"
                  name="shippingEmail"
                  type="email"
                  value={formData.shippingEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingPhone">Phone Number</Label>
                <Input
                  id="shippingPhone"
                  name="shippingPhone"
                  value={formData.shippingPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="bg-orange-500 hover:bg-emerald-900 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

