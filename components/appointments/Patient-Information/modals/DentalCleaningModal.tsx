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

interface DentalCleaningModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface DentalCleaningFormData {
  cleaningType: string
  anesthesiaType: string
  procedureDate: string
  findings: string
  notes: string
  complications: string
  ownerConsent: boolean
}

export default function DentalCleaningModal({ open, onClose, patientId, appointmentId }: DentalCleaningModalProps) {
  const [formData, setFormData] = useState<DentalCleaningFormData>({
    cleaningType: "",
    anesthesiaType: "",
    procedureDate: new Date().toISOString().slice(0, 16),
    findings: "",
    notes: "",
    complications: "",
    ownerConsent: false
  })

  const cleaningTypes = [
    { value: "scaling", label: "Scaling" },
    { value: "polishing", label: "Polishing" },
    { value: "scaling-polishing", label: "Scaling + Polishing" },
    { value: "other", label: "Other" }
  ]

  const anesthesiaTypes = [
    { value: "general", label: "General Anesthesia" },
    { value: "local", label: "Local Anesthesia" },
    { value: "none", label: "None" }
  ]

  const handleInputChange = (field: keyof DentalCleaningFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = ['cleaningType', 'anesthesiaType', 'procedureDate']
    const missingFields = requiredFields.filter(field => !formData[field as keyof DentalCleaningFormData])
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }
    try {
      // Here you would typically send the data to your API
      console.log('Dental Cleaning Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "PREDEN005"
      })
      toast.success("Dental cleaning procedure registered successfully!")
      // Reset form and close modal
      setFormData({
        cleaningType: "",
        anesthesiaType: "",
        procedureDate: new Date().toISOString().slice(0, 16),
        findings: "",
        notes: "",
        complications: "",
        ownerConsent: false
      })
      onClose()
    } catch (error) {
      toast.error("Failed to register dental cleaning procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🦷 Dental Cleaning Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Scaling and polishing to prevent dental disease. Pet and client information will be automatically linked from the existing appointment record.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cleaningType">
                Cleaning Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.cleaningType} onValueChange={(value) => handleInputChange('cleaningType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cleaning type..." />
                </SelectTrigger>
                <SelectContent>
                  {cleaningTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anesthesiaType">
                Anesthesia Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.anesthesiaType} onValueChange={(value) => handleInputChange('anesthesiaType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthesia type..." />
                </SelectTrigger>
                <SelectContent>
                  {anesthesiaTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="procedureDate">
              Procedure Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={formData.procedureDate}
              onChange={(e) => handleInputChange('procedureDate', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="findings">Oral Findings</Label>
            <Textarea
              value={formData.findings}
              onChange={(e) => handleInputChange('findings', e.target.value)}
              placeholder="Describe any tartar, gingivitis, missing teeth, etc."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or instructions..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complications">Complications (if any)</Label>
            <Textarea
              value={formData.complications}
              onChange={(e) => handleInputChange('complications', e.target.value)}
              placeholder="Describe any complications encountered during the procedure."
              rows={3}
            />
          </div>
          <div className="space-y-4">
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