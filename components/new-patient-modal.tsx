"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Combobox } from "@/components/ui/combobox"

interface NewPatientModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    gender: "",
    owner: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Patient data:", formData)
    // Here you would typically save the data to your backend
    onClose()
  }

  // Define options for Combobox components
  const speciesOptions = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "rabbit", label: "Rabbit" },
    { value: "bird", label: "Bird" },
    { value: "reptile", label: "Reptile" },
    { value: "other", label: "Other" },
  ]

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "unknown", label: "Unknown" },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          <SheetHeader
            className="text-white p-6 flex flex-row justify-between items-center"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <SheetTitle className="text-2xl font-bold text-white">Add New Patient</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Combobox
                  options={speciesOptions}
                  value={formData.species}
                  onValueChange={(value) => handleSelectChange("species", value)}
                  placeholder="Select species"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Combobox
                  options={genderOptions}
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  placeholder="Select gender"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" name="owner" value={formData.owner} onChange={handleChange} required />
            </div>

            <div className="flex justify-end space-x-4 pt-4 mt-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="theme-button text-white">
                Save Patient
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
