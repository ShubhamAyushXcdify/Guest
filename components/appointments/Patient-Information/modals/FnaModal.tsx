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

interface FnaModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface FnaFormData {
  massLocation: string
  sampleSize: string
  numberOfAspirates: string
  appearance: string
  notes: string
  ownerConsent: boolean
}

export default function FnaModal({ open, onClose, patientId, appointmentId }: FnaModalProps) {
  const [formData, setFormData] = useState<FnaFormData>({
    massLocation: "",
    sampleSize: "",
    numberOfAspirates: "",
    appearance: "",
    notes: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof FnaFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ["massLocation", "numberOfAspirates"]
    const missingFields = requiredFields.filter(field => !formData[field as keyof FnaFormData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("FNA Documentation Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAFIN011"
      })

      toast.success("Fine Needle Aspiration documented successfully!")

      setFormData({
        massLocation: "",
        sampleSize: "",
        numberOfAspirates: "",
        appearance: "",
        notes: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to document FNA procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🧬 Fine Needle Aspiration (FNA)
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Sampling of masses for cytological examination. Data will be linked to the active appointment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="massLocation">
              Mass Location <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.massLocation}
              onChange={(e) => handleInputChange("massLocation", e.target.value)}
              placeholder="e.g., Right inguinal area"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sampleSize">Sample Size (approx)</Label>
              <Input
                value={formData.sampleSize}
                onChange={(e) => handleInputChange("sampleSize", e.target.value)}
                placeholder="e.g., 2 mm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfAspirates">
                Number of Aspirates <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={formData.numberOfAspirates}
                onChange={(e) => handleInputChange("numberOfAspirates", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appearance">Sample Appearance</Label>
            <Input
              value={formData.appearance}
              onChange={(e) => handleInputChange("appearance", e.target.value)}
              placeholder="e.g., Blood-tinged, cloudy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes or Observations</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any observations or additional notes..."
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
              Owner consent obtained for procedure <span className="text-red-500">*</span>
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
