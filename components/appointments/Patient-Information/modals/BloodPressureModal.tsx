"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { X } from "lucide-react"

interface BloodPressureModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface BloodPressureFormData {
  systolic: string
  diastolic: string
  measurementTime: string
  clinicalNotes: string
  ownerConsent: boolean
}

export default function BloodPressureModal({ open, onClose, patientId, appointmentId }: BloodPressureModalProps) {
  const [formData, setFormData] = useState<BloodPressureFormData>({
    systolic: "",
    diastolic: "",
    measurementTime: new Date().toISOString().slice(0, 16),
    clinicalNotes: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof BloodPressureFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ["systolic", "diastolic", "measurementTime"]
    const missingFields = requiredFields.filter(field => !formData[field as keyof BloodPressureFormData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Blood Pressure Documentation:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIABLO009"
      })

      toast.success("Blood pressure documentation saved successfully!")

      setFormData({
        systolic: "",
        diastolic: "",
        measurementTime: new Date().toISOString().slice(0, 16),
        clinicalNotes: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to save blood pressure data")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[60%] lg:!max-w-[60%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🩺 Blood Pressure Measurement
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Used to assess cardiovascular or kidney health. Pet and appointment info are auto-linked.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Systolic Pressure (mmHg) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={formData.systolic}
                onChange={(e) => handleInputChange("systolic", e.target.value)}
                min="0"
                placeholder="e.g., 120"
              />
            </div>

            <div className="space-y-2">
              <Label>Diastolic Pressure (mmHg) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={formData.diastolic}
                onChange={(e) => handleInputChange("diastolic", e.target.value)}
                min="0"
                placeholder="e.g., 80"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Measurement Date & Time <span className="text-red-500">*</span></Label>
            <Input
              type="datetime-local"
              value={formData.measurementTime}
              onChange={(e) => handleInputChange("measurementTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Clinical Notes</Label>
            <Textarea
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange("clinicalNotes", e.target.value)}
              placeholder="Include any observed signs or veterinarian comments"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownerConsent"
                checked={formData.ownerConsent}
                onCheckedChange={(checked) => handleInputChange("ownerConsent", checked as boolean)}
                required
              />
              <Label htmlFor="ownerConsent">
                Owner consent obtained <span className="text-red-500">*</span>
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
