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

interface NeuterModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface NeuterFormData {
  anesthesiaType: string
  incisionLocation: string
  complications: string
  postOpInstructions: string
  painManagement: string
  ownerConsent: boolean
}

export default function NeuterModal({ open, onClose, patientId, appointmentId }: NeuterModalProps) {
  const [formData, setFormData] = useState<NeuterFormData>({
    anesthesiaType: "",
    incisionLocation: "",
    complications: "",
    postOpInstructions: "",
    painManagement: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof NeuterFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.anesthesiaType || !formData.incisionLocation || !formData.postOpInstructions || !formData.painManagement) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Neuter Procedure Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "SURNEU002"
      })

      toast.success("Neuter procedure documented successfully!")

      setFormData({
        anesthesiaType: "",
        incisionLocation: "",
        complications: "",
        postOpInstructions: "",
        painManagement: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to save neuter documentation")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🏥 Neuter (Castration) Documentation
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Anesthesia Type <span className="text-red-500">*</span></Label>
              <Input
                value={formData.anesthesiaType}
                onChange={(e) => handleInputChange("anesthesiaType", e.target.value)}
                placeholder="e.g., Isoflurane, Ketamine"
              />
            </div>

            <div className="space-y-2">
              <Label>Incision Location <span className="text-red-500">*</span></Label>
              <Input
                value={formData.incisionLocation}
                onChange={(e) => handleInputChange("incisionLocation", e.target.value)}
                placeholder="e.g., Pre-scrotal"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intra/Post-Op Complications</Label>
            <Textarea
              value={formData.complications}
              onChange={(e) => handleInputChange("complications", e.target.value)}
              placeholder="e.g., Mild bleeding, scrotal swelling"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Post-Operative Instructions <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.postOpInstructions}
              onChange={(e) => handleInputChange("postOpInstructions", e.target.value)}
              placeholder="e.g., No licking, e-collar for 10 days, limit activity"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Pain Management Plan <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.painManagement}
              onChange={(e) => handleInputChange("painManagement", e.target.value)}
              placeholder="e.g., Meloxicam 0.1 mg/kg q24h for 3 days"
              rows={2}
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
