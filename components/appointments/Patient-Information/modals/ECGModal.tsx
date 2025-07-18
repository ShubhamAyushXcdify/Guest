"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { X } from "lucide-react"

interface ECGModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface ECGFormData {
  collectionTime: string
  clinicalNotes: string
  ownerConsent: boolean
}

export default function ECGModal({ open, onClose, patientId, appointmentId }: ECGModalProps) {
  const [formData, setFormData] = useState<ECGFormData>({
    collectionTime: new Date().toISOString().slice(0, 16),
    clinicalNotes: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof ECGFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.collectionTime) {
      toast.error("Collection time is required")
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("ECG Registration Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAELE008"
      })

      toast.success("ECG procedure registered successfully!")

      setFormData({
        collectionTime: new Date().toISOString().slice(0, 16),
        clinicalNotes: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to register ECG procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[60%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            📈 Electrocardiogram (ECG/EKG) Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Measures electrical activity of the heart. Patient and appointment details are auto-linked.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="collectionTime">
              Collection Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={formData.collectionTime}
              onChange={(e) => handleInputChange("collectionTime", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
            <Textarea
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange("clinicalNotes", e.target.value)}
              placeholder="Describe reason for ECG, observed arrhythmia, syncopal episodes, etc."
              rows={4}
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
