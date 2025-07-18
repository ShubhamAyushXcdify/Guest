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

interface OphthalmicExamModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface OphthalmicExamData {
  eyePressure: string
  visualResponse: string
  dischargeNotes: string
  clinicalNotes: string
  ownerConsent: boolean
}

export default function OphthalmicExamModal({ open, onClose, patientId, appointmentId }: OphthalmicExamModalProps) {
  const [formData, setFormData] = useState<OphthalmicExamData>({
    eyePressure: "",
    visualResponse: "",
    dischargeNotes: "",
    clinicalNotes: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof OphthalmicExamData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.eyePressure || !formData.visualResponse || !formData.ownerConsent) {
      toast.error("Please complete all required fields and confirm owner consent")
      return
    }

    try {
      console.log("Ophthalmic Exam Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAOPH010"
      })

      toast.success("Ophthalmic exam documented successfully!")

      setFormData({
        eyePressure: "",
        visualResponse: "",
        dischargeNotes: "",
        clinicalNotes: "",
        ownerConsent: false
      })

      onClose()
    } catch (err) {
      toast.error("Failed to document ophthalmic exam")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[60%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            👁️ Ophthalmic Exam Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This form documents results of the eye examination, including intraocular pressure and visual response.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="eyePressure">Intraocular Pressure (mmHg) <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={formData.eyePressure}
              onChange={(e) => handleInputChange("eyePressure", e.target.value)}
              placeholder="e.g., OS: 15, OD: 16"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visualResponse">Visual Response <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={formData.visualResponse}
              onChange={(e) => handleInputChange("visualResponse", e.target.value)}
              placeholder="Normal, sluggish, absent, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dischargeNotes">Ocular Discharge / Abnormalities</Label>
            <Textarea
              value={formData.dischargeNotes}
              onChange={(e) => handleInputChange("dischargeNotes", e.target.value)}
              placeholder="Note presence of discharge, cloudiness, redness, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
            <Textarea
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange("clinicalNotes", e.target.value)}
              placeholder="Additional remarks from the examination..."
              rows={3}
            />
          </div>

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
