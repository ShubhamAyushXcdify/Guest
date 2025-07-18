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

interface HealthCertificateModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface HealthCertificateFormData {
  certificateType: string
  certificateNumber: string
  issuanceDate: string
  expiryDate: string
  purpose: string
  destinationAddress: string
  physicalExamDate: string
  weight: string
  temperature: string
  generalCondition: string
  vaccinations: string[]
  parasiteTreatment: string
  lastTreatmentDate: string
  microchipVerified: boolean
  veterinarianName: string
  licenseNumber: string
  clinicAddress: string
  ownerConsent: boolean
  notes: string
}

export default function HealthCertificateModal({ open, onClose, patientId, appointmentId }: HealthCertificateModalProps) {
  const [formData, setFormData] = useState<HealthCertificateFormData>({
    certificateType: "",
    certificateNumber: "",
    issuanceDate: new Date().toISOString().slice(0, 16),
    expiryDate: "",
    purpose: "",
    destinationAddress: "",
    physicalExamDate: new Date().toISOString().slice(0, 16),
    weight: "",
    temperature: "",
    generalCondition: "",
    vaccinations: [],
    parasiteTreatment: "",
    lastTreatmentDate: "",
    microchipVerified: false,
    veterinarianName: "",
    licenseNumber: "",
    clinicAddress: "",
    ownerConsent: false,
    notes: ""
  })

  const certificateTypes = [
    { value: "international", label: "International Health Certificate" },
    { value: "domestic", label: "Domestic Health Certificate" },
    { value: "airline", label: "Airline Travel Certificate" },
    { value: "show", label: "Show/Exhibition Certificate" }
  ]

  const purposes = [
    { value: "travel", label: "International Travel" },
    { value: "domestic-travel", label: "Domestic Travel" },
    { value: "relocation", label: "Pet Relocation" },
    { value: "show", label: "Show/Exhibition" },
    { value: "sale", label: "Sale/Transfer" }
  ]

  const conditions = [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" }
  ]

  const requiredVaccinations = [
    { value: "rabies", label: "Rabies" },
    { value: "dhpp", label: "DHPP" },
    { value: "bordetella", label: "Bordetella" },
    { value: "influenza", label: "Influenza" },
    { value: "leptospirosis", label: "Leptospirosis" }
  ]

  const handleInputChange = (field: keyof HealthCertificateFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = [
      'certificateType',
      'certificateNumber',
      'issuanceDate',
      'expiryDate',
      'purpose',
      'physicalExamDate',
      'weight',
      'temperature',
      'generalCondition',
      'veterinarianName',
      'licenseNumber',
      'clinicAddress'
    ]
    const missingFields = requiredFields.filter(field => !formData[field as keyof HealthCertificateFormData])
    
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
      console.log('Health Certificate Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "TRAHEA002"
      })
      
      toast.success("Health certificate registered successfully!")
      
      // Reset form and close modal
      setFormData({
        certificateType: "",
        certificateNumber: "",
        issuanceDate: new Date().toISOString().slice(0, 16),
        expiryDate: "",
        purpose: "",
        destinationAddress: "",
        physicalExamDate: new Date().toISOString().slice(0, 16),
        weight: "",
        temperature: "",
        generalCondition: "",
        vaccinations: [],
        parasiteTreatment: "",
        lastTreatmentDate: "",
        microchipVerified: false,
        veterinarianName: "",
        licenseNumber: "",
        clinicAddress: "",
        ownerConsent: false,
        notes: ""
      })
      
      onClose()
    } catch (error) {
      toast.error("Failed to register health certificate")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            📋 Health Certificate Documentation
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
              <Label htmlFor="certificateType">
                Certificate Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.certificateType} onValueChange={(value) => handleInputChange('certificateType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type..." />
                </SelectTrigger>
                <SelectContent>
                  {certificateTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateNumber">
                Certificate Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.certificateNumber}
                onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                placeholder="Enter certificate number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issuanceDate">
                Issuance Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.issuanceDate}
                onChange={(e) => handleInputChange('issuanceDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.purpose} onValueChange={(value) => handleInputChange('purpose', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose..." />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map(purpose => (
                    <SelectItem key={purpose.value} value={purpose.value}>{purpose.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationAddress">Destination Address</Label>
              <Input
                type="text"
                value={formData.destinationAddress}
                onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
                placeholder="Enter destination address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperature (°C) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="Enter temperature"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generalCondition">
                General Condition <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.generalCondition} onValueChange={(value) => handleInputChange('generalCondition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition..." />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
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
              <Label htmlFor="lastTreatmentDate">Last Treatment Date</Label>
              <Input
                type="date"
                value={formData.lastTreatmentDate}
                onChange={(e) => handleInputChange('lastTreatmentDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarianName">
                Veterinarian Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.veterinarianName}
                onChange={(e) => handleInputChange('veterinarianName', e.target.value)}
                placeholder="Enter veterinarian name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                License Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicAddress">
              Clinic Address <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.clinicAddress}
              onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
              placeholder="Enter clinic address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any other relevant notes about the health certificate..."
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