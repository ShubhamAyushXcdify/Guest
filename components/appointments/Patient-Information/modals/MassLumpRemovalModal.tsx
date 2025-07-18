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

interface MassLumpRemovalModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface MassLumpFormData {
  location: string
  sizeDescription: string
  appearance: string
  suspectedDiagnosis: string
  notes: string
  consent: boolean
}

export default function MassLumpRemovalModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: MassLumpRemovalModalProps) {
  const [formData, setFormData] = useState<MassLumpFormData>({
    location: "",
    sizeDescription: "",
    appearance: "",
    suspectedDiagnosis: "",
    notes: "Excision of benign or malignant growths",
    consent: false,
  })

  const handleInputChange = (field: keyof MassLumpFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.location || !formData.notes || !formData.consent) {
      toast.error("Please complete all required fields and confirm consent.")
      return
    }

    try {
      console.log("Mass/Lump Removal Procedure Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "SURMAS003"
      })

      toast.success("Mass/Lump Removal procedure documented.")
      setFormData({
        location: "",
        sizeDescription: "",
        appearance: "",
        suspectedDiagnosis: "",
        notes: "Excision of benign or malignant growths",
        consent: false,
      })
      onClose()
    } catch (err) {
      toast.error("Failed to document Mass/Lump Removal procedure.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🧼 Mass/Lump Removal Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Patient and appointment context is automatically linked.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Mass/Lump Location <span className="text-red-500">*</span></Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Left forelimb"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizeDescription">Size & Characteristics</Label>
            <Input
              id="sizeDescription"
              value={formData.sizeDescription}
              onChange={(e) => handleInputChange("sizeDescription", e.target.value)}
              placeholder="e.g., 2cm x 3cm, firm, movable"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appearance">Appearance</Label>
            <Textarea
              id="appearance"
              value={formData.appearance}
              onChange={(e) => handleInputChange("appearance", e.target.value)}
              placeholder="Surface, color, ulceration, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspectedDiagnosis">Suspected Diagnosis</Label>
            <Textarea
              id="suspectedDiagnosis"
              value={formData.suspectedDiagnosis}
              onChange={(e) => handleInputChange("suspectedDiagnosis", e.target.value)}
              placeholder="e.g., Lipoma, Mast cell tumor"
              rows={2}
            />
          </div>

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
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
              required
            />
            <Label htmlFor="consent" className="ml-2">
              Owner consent confirmed <span className="text-red-500">*</span>
            </Label>
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
