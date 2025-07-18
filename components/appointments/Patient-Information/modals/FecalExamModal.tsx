"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { X } from "lucide-react"

interface FecalExamModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface FecalExamFormData {
  collectionMethod: string
  collectionTime: string
  consistency: string
  parasiteSigns: string
  urgencyLevel: string
  notes: string
  ownerConsent: boolean
}

export default function FecalExamModal({ open, onClose, patientId, appointmentId }: FecalExamModalProps) {
  const [formData, setFormData] = useState<FecalExamFormData>({
    collectionMethod: "",
    collectionTime: new Date().toISOString().slice(0, 16),
    consistency: "",
    parasiteSigns: "",
    urgencyLevel: "",
    notes: "",
    ownerConsent: false,
  })

  const urgencyLevels = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" },
  ]

  const handleInputChange = (field: keyof FecalExamFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ["collectionMethod", "collectionTime", "urgencyLevel"]
    const missingFields = requiredFields.filter(field => !formData[field as keyof FecalExamFormData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Fecal Exam Data", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAFEC003",
      })

      toast.success("Fecal Exam recorded successfully!")

      setFormData({
        collectionMethod: "",
        collectionTime: new Date().toISOString().slice(0, 16),
        consistency: "",
        parasiteSigns: "",
        urgencyLevel: "",
        notes: "",
        ownerConsent: false,
      })

      onClose()
    } catch {
      toast.error("Failed to record Fecal Exam")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-full md:max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            💩 Fecal Exam Documentation
            <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="collectionMethod">Collection Method <span className="text-red-500">*</span></Label>
              <Select value={formData.collectionMethod} onValueChange={val => handleInputChange("collectionMethod", val)}>
                <SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner-collected">Owner Collected</SelectItem>
                  <SelectItem value="in-clinic">In-Clinic Collection</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionTime">Collection Date & Time <span className="text-red-500">*</span></Label>
              <Input
                type="datetime-local"
                value={formData.collectionTime}
                onChange={(e) => handleInputChange("collectionTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consistency">Sample Consistency</Label>
            <Select value={formData.consistency} onValueChange={val => handleInputChange("consistency", val)}>
              <SelectTrigger><SelectValue placeholder="Select consistency..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="firm">Firm</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
                <SelectItem value="watery">Watery</SelectItem>
                <SelectItem value="mucous">Mucous Present</SelectItem>
                <SelectItem value="bloody">Bloody</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parasiteSigns">Visible Parasites or Worms</Label>
            <Textarea
              value={formData.parasiteSigns}
              onChange={(e) => handleInputChange("parasiteSigns", e.target.value)}
              placeholder="Note any visible signs of parasites in stool."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgencyLevel">Urgency <span className="text-red-500">*</span></Label>
            <Select value={formData.urgencyLevel} onValueChange={val => handleInputChange("urgencyLevel", val)}>
              <SelectTrigger><SelectValue placeholder="Select urgency..." /></SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Include any relevant clinical context or history."
              rows={4}
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
