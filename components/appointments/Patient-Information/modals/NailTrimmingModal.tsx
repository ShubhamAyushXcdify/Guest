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

interface NailTrimmingModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface NailTrimmingFormData {
  notes: string
  bleedingOccurred: boolean
  difficultyLevel: string
  specialInstructions: string
  ownerConsent: boolean
}

export default function NailTrimmingModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: NailTrimmingModalProps) {
  const [formData, setFormData] = useState<NailTrimmingFormData>({
    notes: "Routine grooming for paw health and comfort",
    bleedingOccurred: false,
    difficultyLevel: "",
    specialInstructions: "",
    ownerConsent: false,
  })

  const handleInputChange = (field: keyof NailTrimmingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      // Simulate API call
      console.log("Nail Trimming Procedure:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "PRENAI007"
      })

      toast.success("Nail trimming documented successfully.")

      setFormData({
        notes: "Routine grooming for paw health and comfort",
        bleedingOccurred: false,
        difficultyLevel: "",
        specialInstructions: "",
        ownerConsent: false,
      })

      onClose()
    } catch (error) {
      toast.error("Failed to document nail trimming.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            ✂️ Nail Trimming Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> This grooming record will be linked to the current patient appointment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Procedure Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Difficulty Level</Label>
            <Input
              id="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={(e) => handleInputChange("difficultyLevel", e.target.value)}
              placeholder="e.g., Easy, Moderate, Difficult due to anxiety"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions / Observations</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bleedingOccurred"
                checked={formData.bleedingOccurred}
                onCheckedChange={(checked) => handleInputChange("bleedingOccurred", checked as boolean)}
              />
              <Label htmlFor="bleedingOccurred">Minor bleeding occurred during trim</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownerConsent"
                checked={formData.ownerConsent}
                onCheckedChange={(checked) => handleInputChange("ownerConsent", checked as boolean)}
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
            <Button type="submit">Save</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
