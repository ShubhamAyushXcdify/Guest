"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { X } from "lucide-react"

interface EyeSurgeryModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface EyeSurgeryFormData {
  surgeryType: string
  eyeSide: string
  anesthesiaType: string
  surgeryDateTime: string
  surgeon: string
  complications: string
  postOpInstructions: string
  ownerConsent: boolean
  notes: string
}

export default function EyeSurgeryModal({ open, onClose, patientId, appointmentId }: EyeSurgeryModalProps) {
  const [formData, setFormData] = useState<EyeSurgeryFormData>({
    surgeryType: "",
    eyeSide: "",
    anesthesiaType: "",
    surgeryDateTime: new Date().toISOString().slice(0, 16),
    surgeon: "",
    complications: "",
    postOpInstructions: "",
    ownerConsent: false,
    notes: ""
  })

  const surgeryTypes = [
    { value: "entropion", label: "Entropion Correction" },
    { value: "cherry-eye", label: "Cherry Eye Repair" },
    { value: "eyelid-mass", label: "Eyelid Mass Removal" },
    { value: "enucleation", label: "Enucleation" },
    { value: "other", label: "Other" }
  ]

  const eyeSides = [
    { value: "left", label: "Left Eye" },
    { value: "right", label: "Right Eye" },
    { value: "both", label: "Both Eyes" }
  ]

  const anesthesiaTypes = [
    { value: "general", label: "General" },
    { value: "local", label: "Local" },
    { value: "sedation", label: "Sedation" }
  ]

  const handleInputChange = (field: keyof EyeSurgeryFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = ['surgeryType', 'eyeSide', 'anesthesiaType', 'surgeryDateTime', 'surgeon']
    const missingFields = requiredFields.filter(field => !formData[field as keyof EyeSurgeryFormData])
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }
    try {
      // Here you would typically send the data to your API
      console.log('Eye Surgery Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "SUREYE007"
      })
      toast.success("Eye surgery procedure registered successfully!")
      // Reset form and close modal
      setFormData({
        surgeryType: "",
        eyeSide: "",
        anesthesiaType: "",
        surgeryDateTime: new Date().toISOString().slice(0, 16),
        surgeon: "",
        complications: "",
        postOpInstructions: "",
        ownerConsent: false,
        notes: ""
      })
      onClose()
    } catch (error) {
      toast.error("Failed to register eye surgery procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            👁️ Eye Surgery Documentation
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Pet and client information will be automatically linked from the existing appointment record.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surgeryType">
                Surgery Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.surgeryType} onValueChange={(value) => handleInputChange('surgeryType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select surgery type..." />
                </SelectTrigger>
                <SelectContent>
                  {surgeryTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eyeSide">
                Eye Side <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.eyeSide} onValueChange={(value) => handleInputChange('eyeSide', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select eye..." />
                </SelectTrigger>
                <SelectContent>
                  {eyeSides.map(side => (
                    <SelectItem key={side.value} value={side.value}>{side.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anesthesiaType">
                Anesthesia Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.anesthesiaType} onValueChange={(value) => handleInputChange('anesthesiaType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthesia..." />
                </SelectTrigger>
                <SelectContent>
                  {anesthesiaTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="surgeryDateTime">
                Surgery Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.surgeryDateTime}
                onChange={(e) => handleInputChange('surgeryDateTime', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="surgeon">
              Surgeon <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.surgeon}
              onChange={(e) => handleInputChange('surgeon', e.target.value)}
              placeholder="Name of surgeon"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complications">Intra/Post-Op Complications</Label>
            <Textarea
              value={formData.complications}
              onChange={(e) => handleInputChange('complications', e.target.value)}
              placeholder="Describe any complications during or after surgery..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postOpInstructions">Post-Op Instructions</Label>
            <Textarea
              value={formData.postOpInstructions}
              onChange={(e) => handleInputChange('postOpInstructions', e.target.value)}
              placeholder="Instructions for post-operative care, medications, follow-up, etc."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any other relevant notes..."
              rows={3}
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownerConsent"
                checked={formData.ownerConsent}
                onCheckedChange={(checked) => handleInputChange('ownerConsent', checked as boolean)}
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