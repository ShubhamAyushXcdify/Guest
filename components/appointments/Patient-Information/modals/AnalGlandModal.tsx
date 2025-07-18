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

interface AnalGlandModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface AnalGlandFormData {
  notes: string
  expressionSuccessful: boolean
  anyComplications: string
  ownerConsent: boolean
}

export default function AnalGlandExpressionModal({ open, onClose, patientId, appointmentId }: AnalGlandModalProps) {
  const [formData, setFormData] = useState<AnalGlandFormData>({
    notes: "",
    expressionSuccessful: true,
    anyComplications: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof AnalGlandFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Anal Gland Expression Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "PREANA008"
      })

      toast.success("Anal gland expression documented successfully!")

      setFormData({
        notes: "Manual release of anal glands to prevent impaction",
        expressionSuccessful: true,
        anyComplications: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to document procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🐕 Anal Gland Expression
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Documentation will be saved to the current appointment and linked with the pet record.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Procedure Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anyComplications">Complications (if any)</Label>
            <Textarea
              value={formData.anyComplications}
              onChange={(e) => handleInputChange("anyComplications", e.target.value)}
              placeholder="e.g. inflammation, discharge, discomfort..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expressionSuccessful"
                checked={formData.expressionSuccessful}
                onCheckedChange={(checked) => handleInputChange("expressionSuccessful", checked as boolean)}
              />
              <Label htmlFor="expressionSuccessful">Expression was successful</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownerConsent"
                checked={formData.ownerConsent}
                onCheckedChange={(checked) => handleInputChange("ownerConsent", checked as boolean)}
                required
              />
              <Label htmlFor="ownerConsent">Owner consent obtained <span className="text-red-500">*</span></Label>
            </div>
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
