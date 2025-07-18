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

interface SkinScrapingModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface SkinScrapingFormData {
  sampleSite: string
  collectionTime: string
  clinicalNotes: string
  ownerConsent: boolean
}

export default function SkinScrapingModal({ open, onClose, patientId, appointmentId }: SkinScrapingModalProps) {
  const [formData, setFormData] = useState<SkinScrapingFormData>({
    sampleSite: "",
    collectionTime: new Date().toISOString().slice(0, 16),
    clinicalNotes: "",
    ownerConsent: false
  })

  const handleInputChange = (field: keyof SkinScrapingFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sampleSite || !formData.collectionTime) {
      toast.error("Please fill in required fields: sample site and collection time")
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Skin Scraping Documentation:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIASKI007"
      })

      toast.success("Skin scraping procedure documented successfully")

      setFormData({
        sampleSite: "",
        collectionTime: new Date().toISOString().slice(0, 16),
        clinicalNotes: "",
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to save skin scraping data")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🧫 Skin Scraping Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This procedure is used to detect mites or fungal infections on the skin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sampleSite">
              Sample Site <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="sampleSite"
              value={formData.sampleSite}
              onChange={(e) => handleInputChange("sampleSite", e.target.value)}
              placeholder="e.g., Dorsal neck, inner thigh"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collectionTime">
              Collection Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              id="collectionTime"
              value={formData.collectionTime}
              onChange={(e) => handleInputChange("collectionTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalNotes">Clinical Notes</Label>
            <Textarea
              id="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange("clinicalNotes", e.target.value)}
              placeholder="Observed skin lesions, irritation, suspected parasites, etc."
              rows={3}
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
