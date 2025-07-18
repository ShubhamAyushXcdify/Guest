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

interface XRayModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface XRayFormData {
  bodyArea: string
  viewsRequested: string
  sedationRequired: boolean
  clinicalIndication: string
  urgencyLevel: string
  specialInstructions: string
  ownerConsent: boolean
}

export default function XRayModal({ open, onClose, patientId, appointmentId }: XRayModalProps) {
  const [formData, setFormData] = useState<XRayFormData>({
    bodyArea: "",
    viewsRequested: "",
    sedationRequired: false,
    clinicalIndication: "",
    urgencyLevel: "",
    specialInstructions: "",
    ownerConsent: false
  })

  const urgencyLevels = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" }
  ]

  const handleInputChange = (field: keyof XRayFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ['bodyArea', 'viewsRequested', 'urgencyLevel']
    const missingFields = requiredFields.filter(field => !formData[field as keyof XRayFormData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log('X-Ray Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAXRA004"
      })

      toast.success("X-ray procedure registered successfully!")

      setFormData({
        bodyArea: "",
        viewsRequested: "",
        sedationRequired: false,
        clinicalIndication: "",
        urgencyLevel: "",
        specialInstructions: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to register x-ray procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🩻 X-ray Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Imaging of bones, lungs, and abdominal organs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Body Area for Imaging <span className="text-red-500">*</span></Label>
            <Input
              value={formData.bodyArea}
              onChange={(e) => handleInputChange('bodyArea', e.target.value)}
              placeholder="e.g., Thorax, Abdomen, Limbs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Views Requested <span className="text-red-500">*</span></Label>
            <Input
              value={formData.viewsRequested}
              onChange={(e) => handleInputChange('viewsRequested', e.target.value)}
              placeholder="e.g., Lateral, VD, DV"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Clinical Indication</Label>
            <Textarea
              value={formData.clinicalIndication}
              onChange={(e) => handleInputChange('clinicalIndication', e.target.value)}
              placeholder="Describe the reason for imaging (e.g., coughing, lameness, trauma, etc.)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special positioning, sedation instructions, or precautions"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Urgency Level <span className="text-red-500">*</span></Label>
            <Select value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency..." />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sedationRequired"
                checked={formData.sedationRequired}
                onCheckedChange={(checked) => handleInputChange('sedationRequired', checked as boolean)}
              />
              <Label htmlFor="sedationRequired">Sedation Required</Label>
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
