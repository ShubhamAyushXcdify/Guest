// SpayModal.tsx
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

interface SpayModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface SpayFormData {
  anesthesiaType: string
  incisionDetails: string
  complications: string
  postOpInstructions: string
  painManagement: string
  ownerConsent: boolean
}

export default function SpayModal({ open, onClose, patientId, appointmentId }: SpayModalProps) {
  const [formData, setFormData] = useState<SpayFormData>({
    anesthesiaType: "",
    incisionDetails: "",
    complications: "",
    postOpInstructions: "",
    painManagement: "",
    ownerConsent: false,
  })

  const handleInputChange = (field: keyof SpayFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.anesthesiaType || !formData.ownerConsent) {
      toast.error("Please fill all required fields and obtain owner consent.")
      return
    }

    try {
      console.log("Spay Documentation Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "SURSPA001",
      })

      toast.success("Spay procedure documented successfully!")

      setFormData({
        anesthesiaType: "",
        incisionDetails: "",
        complications: "",
        postOpInstructions: "",
        painManagement: "",
        ownerConsent: false,
      })

      onClose()
    } catch (error) {
      toast.error("Failed to document spay procedure.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-full md:max-w-[70%] lg:max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🐶 Spay (Ovariohysterectomy) Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This procedure involves surgical removal of the ovaries and uterus. Ensure all post-op instructions are clearly recorded.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="anesthesiaType">Anesthesia Type <span className="text-red-500">*</span></Label>
            <Input
              value={formData.anesthesiaType}
              onChange={(e) => handleInputChange("anesthesiaType", e.target.value)}
              placeholder="e.g., Isoflurane, Propofol"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incisionDetails">Incision Details</Label>
            <Textarea
              value={formData.incisionDetails}
              onChange={(e) => handleInputChange("incisionDetails", e.target.value)}
              placeholder="e.g., Midline incision, 2 inches"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complications">Complications Noted</Label>
            <Textarea
              value={formData.complications}
              onChange={(e) => handleInputChange("complications", e.target.value)}
              placeholder="Describe any intraoperative or postoperative complications."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="painManagement">Pain Management</Label>
            <Input
              value={formData.painManagement}
              onChange={(e) => handleInputChange("painManagement", e.target.value)}
              placeholder="e.g., Meloxicam 0.1mg/kg q24h for 3 days"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postOpInstructions">Post-op Instructions</Label>
            <Textarea
              value={formData.postOpInstructions}
              onChange={(e) => handleInputChange("postOpInstructions", e.target.value)}
              placeholder="e.g., Monitor incision site, restrict activity for 10 days"
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
