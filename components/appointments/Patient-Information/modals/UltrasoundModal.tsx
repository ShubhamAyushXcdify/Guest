"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { X } from "lucide-react"

interface UltrasoundModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface UltrasoundFormData {
  bodyArea: string
  views: string
  urgencyLevel: string
  specialInstructions: string
  ownerConsent: boolean
}

export default function UltrasoundModal({ open, onClose, patientId, appointmentId }: UltrasoundModalProps) {
  const [formData, setFormData] = useState<UltrasoundFormData>({
    bodyArea: "",
    views: "",
    urgencyLevel: "",
    specialInstructions: "",
    ownerConsent: false
  })

  const urgencyLevels = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" }
  ]

  const handleInputChange = (field: keyof UltrasoundFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ["bodyArea", "views", "urgencyLevel"]
    const missingFields = requiredFields.filter(field => !formData[field as keyof UltrasoundFormData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Ultrasound Procedure:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAULT005"
      })

      toast.success("Ultrasound procedure documented successfully!")

      setFormData({
        bodyArea: "",
        views: "",
        urgencyLevel: "",
        specialInstructions: "",
        ownerConsent: false
      })

      onClose()
    } catch (err) {
      toast.error("Failed to document ultrasound procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🔍 Ultrasound Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Ultrasound is a non-invasive imaging of internal organs. Patient and appointment details are automatically linked.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bodyArea">Body Area <span className="text-red-500">*</span></Label>
            <Input
              id="bodyArea"
              value={formData.bodyArea}
              onChange={(e) => handleInputChange("bodyArea", e.target.value)}
              placeholder="e.g., Abdomen, Thorax, Cardiac"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="views">Views Required <span className="text-red-500">*</span></Label>
            <Input
              id="views"
              value={formData.views}
              onChange={(e) => handleInputChange("views", e.target.value)}
              placeholder="e.g., Longitudinal, Transverse"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Urgency Level <span className="text-red-500">*</span></Label>
            <Select value={formData.urgencyLevel} onValueChange={(val) => handleInputChange("urgencyLevel", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency..." />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              placeholder="e.g., patient must be fasting, repeat scan if needed"
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
