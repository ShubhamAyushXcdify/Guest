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

interface BloodTestModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface BloodTestFormData {
  fastingStatus: boolean
  clinicalNotes: string
  urgencyLevel: string
  ownerConsent: boolean
}

export default function BloodTestModal({ open, onClose, patientId, appointmentId }: BloodTestModalProps) {
  const [formData, setFormData] = useState<BloodTestFormData>({
    fastingStatus: false,
    clinicalNotes: "",
    urgencyLevel: "",
    ownerConsent: false
  })

  const urgencyLevels = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" }
  ]

  const handleInputChange = (field: keyof BloodTestFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.urgencyLevel) {
      toast.error("Please select an urgency level")
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Blood Test Registration Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIABLO001"
      })

      toast.success("Blood test procedure registered successfully!")

      setFormData({
        fastingStatus: false,
        clinicalNotes: "",
        urgencyLevel: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to register blood test procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🧫 Blood Test Documentation
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Includes CBC and biochemistry to screen for diseases.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">
              Urgency Level <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.urgencyLevel}
              onChange={(e) => handleInputChange("urgencyLevel", e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="" disabled>Select urgency...</option>
              {urgencyLevels.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
            <Textarea
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange("clinicalNotes", e.target.value)}
              placeholder="Provide details for lab about clinical background or symptoms..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="fastingStatus"
              checked={formData.fastingStatus}
              onCheckedChange={(checked) => handleInputChange("fastingStatus", checked as boolean)}
            />
            <Label htmlFor="fastingStatus">Pet was fasting prior to blood draw</Label>
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
