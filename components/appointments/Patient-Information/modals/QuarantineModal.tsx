"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { X } from "lucide-react"

interface QuarantineModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface QuarantineFormData {
  destinationCountry: string
  travelDate: string
  quarantineType: string
  quarantineDuration: string
  vaccinations: string[]
  testingRequired: string[]
  parasiteTreatment: string
  treatmentDate: string
  microchipVerified: boolean
  passportNumber: string
  certifyingVet: string
  certificationDate: string
  ownerConsent: boolean
  notes: string
}

export default function QuarantineModal({ open, onClose, patientId, appointmentId }: QuarantineModalProps) {
  const [formData, setFormData] = useState<QuarantineFormData>({
    destinationCountry: "",
    travelDate: "",
    quarantineType: "",
    quarantineDuration: "",
    vaccinations: [],
    testingRequired: [],
    parasiteTreatment: "",
    treatmentDate: new Date().toISOString().slice(0, 16),
    microchipVerified: false,
    passportNumber: "",
    certifyingVet: "",
    certificationDate: new Date().toISOString().slice(0, 16),
    ownerConsent: false,
    notes: ""
  })

  const quarantineTypes = [
    { value: "pre-departure", label: "Pre-Departure Isolation" },
    { value: "post-arrival", label: "Post-Arrival Quarantine" },
    { value: "home", label: "Home Quarantine" },
    { value: "facility", label: "Facility Quarantine" }
  ]

  const durations = [
    { value: "7", label: "7 Days" },
    { value: "10", label: "10 Days" },
    { value: "14", label: "14 Days" },
    { value: "21", label: "21 Days" },
    { value: "30", label: "30 Days" },
    { value: "custom", label: "Custom Duration" }
  ]

  const requiredVaccinations = [
    { value: "rabies", label: "Rabies" },
    { value: "dhpp", label: "DHPP" },
    { value: "bordetella", label: "Bordetella" },
    { value: "influenza", label: "Influenza" },
    { value: "leptospirosis", label: "Leptospirosis" }
  ]

  const requiredTests = [
    { value: "rabies-titer", label: "Rabies Titer Test" },
    { value: "blood-work", label: "Complete Blood Work" },
    { value: "parasite", label: "Parasite Screening" },
    { value: "heartworm", label: "Heartworm Test" },
    { value: "skin-scrape", label: "Skin Scraping Test" }
  ]

  const handleInputChange = (field: keyof QuarantineFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = [
      'destinationCountry', 
      'travelDate', 
      'quarantineType', 
      'quarantineDuration',
      'certifyingVet',
      'certificationDate'
    ]
    const missingFields = requiredFields.filter(field => !formData[field as keyof QuarantineFormData])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    if (formData.vaccinations.length === 0) {
      toast.error("At least one vaccination must be selected")
      return
    }

    try {
      // Here you would typically send the data to your API
      console.log('Export Quarantine Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "TRAEXP003"
      })
      
      toast.success("Export quarantine procedure registered successfully!")
      
      // Reset form and close modal
      setFormData({
        destinationCountry: "",
        travelDate: "",
        quarantineType: "",
        quarantineDuration: "",
        vaccinations: [],
        testingRequired: [],
        parasiteTreatment: "",
        treatmentDate: new Date().toISOString().slice(0, 16),
        microchipVerified: false,
        passportNumber: "",
        certifyingVet: "",
        certificationDate: new Date().toISOString().slice(0, 16),
        ownerConsent: false,
        notes: ""
      })
      
      onClose()
    } catch (error) {
      toast.error("Failed to register export quarantine procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            ✈️ Export Quarantine Documentation
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Pet and client information will be automatically linked from the existing appointment record.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destinationCountry">
                Destination Country <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.destinationCountry}
                onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                placeholder="Enter destination country"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelDate">
                Planned Travel Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.travelDate}
                onChange={(e) => handleInputChange('travelDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quarantineType">
                Quarantine Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.quarantineType} onValueChange={(value) => handleInputChange('quarantineType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarantine type..." />
                </SelectTrigger>
                <SelectContent>
                  {quarantineTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quarantineDuration">
                Quarantine Duration <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.quarantineDuration} onValueChange={(value) => handleInputChange('quarantineDuration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration..." />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(duration => (
                    <SelectItem key={duration.value} value={duration.value}>{duration.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Vaccinations <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {requiredVaccinations.map(vax => (
                <div key={vax.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vax-${vax.value}`}
                    checked={formData.vaccinations.includes(vax.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('vaccinations', [...formData.vaccinations, vax.value])
                      } else {
                        handleInputChange('vaccinations', formData.vaccinations.filter(v => v !== vax.value))
                      }
                    }}
                  />
                  <Label htmlFor={`vax-${vax.value}`}>{vax.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Tests</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {requiredTests.map(test => (
                <div key={test.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`test-${test.value}`}
                    checked={formData.testingRequired.includes(test.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('testingRequired', [...formData.testingRequired, test.value])
                      } else {
                        handleInputChange('testingRequired', formData.testingRequired.filter(t => t !== test.value))
                      }
                    }}
                  />
                  <Label htmlFor={`test-${test.value}`}>{test.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parasiteTreatment">Parasite Treatment</Label>
              <Input
                type="text"
                value={formData.parasiteTreatment}
                onChange={(e) => handleInputChange('parasiteTreatment', e.target.value)}
                placeholder="Enter treatment details"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentDate">Treatment Date</Label>
              <Input
                type="datetime-local"
                value={formData.treatmentDate}
                onChange={(e) => handleInputChange('treatmentDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Pet Passport Number</Label>
              <Input
                type="text"
                value={formData.passportNumber}
                onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                placeholder="Enter passport number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifyingVet">
                Certifying Veterinarian <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.certifyingVet}
                onChange={(e) => handleInputChange('certifyingVet', e.target.value)}
                placeholder="Name of certifying vet"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificationDate">
              Certification Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={formData.certificationDate}
              onChange={(e) => handleInputChange('certificationDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any other relevant notes about the quarantine procedure..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="microchipVerified"
                checked={formData.microchipVerified}
                onCheckedChange={(checked) => handleInputChange('microchipVerified', checked as boolean)}
              />
              <Label htmlFor="microchipVerified">Microchip verified and scanned</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownerConsent"
                checked={formData.ownerConsent}
                onCheckedChange={(checked) => handleInputChange('ownerConsent', checked as boolean)}
                required
              />
              <Label htmlFor="ownerConsent">
                Owner consent obtained for procedure <span className="text-red-500">*</span>
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
} 