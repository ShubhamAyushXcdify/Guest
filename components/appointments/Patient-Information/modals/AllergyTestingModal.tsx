import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { X } from "lucide-react"

interface AllergyTestingModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface AllergyTestingFormData {
  allergenType: string
  suspectedAllergens: string
  reactionHistory: string
  testPanel: string
  urgencyLevel: string
  specialInstructions: string
  ownerConsent: boolean
}

export default function AllergyTestingModal({ open, onClose, patientId, appointmentId }: AllergyTestingModalProps) {
  const [formData, setFormData] = useState<AllergyTestingFormData>({
    allergenType: "",
    suspectedAllergens: "",
    reactionHistory: "",
    testPanel: "",
    urgencyLevel: "",
    specialInstructions: "",
    ownerConsent: false
  })

  const urgencyLevels = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "emergency", label: "Emergency" }
  ]

  const handleInputChange = (field: keyof AllergyTestingFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ['allergenType', 'testPanel', 'urgencyLevel']
    const missingFields = requiredFields.filter(field => !formData[field as keyof AllergyTestingFormData])

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    try {
      console.log("Allergy Testing Data:", {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAALLG001"
      })
      toast.success("Allergy testing procedure documented successfully!")
      setFormData({
        allergenType: "",
        suspectedAllergens: "",
        reactionHistory: "",
        testPanel: "",
        urgencyLevel: "",
        specialInstructions: "",
        ownerConsent: false
      })
      onClose()
    } catch {
      toast.error("Failed to document allergy testing procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🌿 Allergy Testing Documentation
          </SheetTitle>
        </SheetHeader>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Allergens may include environmental or food triggers. Confirm owner consent before proceeding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Allergen Type <span className="text-red-500">*</span></Label>
            <Select value={formData.allergenType} onValueChange={(value) => handleInputChange('allergenType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select allergen type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="environmental">Environmental</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Suspected Allergens</Label>
            <Textarea
              value={formData.suspectedAllergens}
              onChange={(e) => handleInputChange('suspectedAllergens', e.target.value)}
              placeholder="List any suspected triggers..."
            />
          </div>

          <div className="space-y-2">
            <Label>Reaction History</Label>
            <Textarea
              value={formData.reactionHistory}
              onChange={(e) => handleInputChange('reactionHistory', e.target.value)}
              placeholder="Describe previous reactions, timing, severity, etc."
            />
          </div>

          <div className="space-y-2">
            <Label>Test Panel <span className="text-red-500">*</span></Label>
            <Select value={formData.testPanel} onValueChange={(value) => handleInputChange('testPanel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select panel..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Panel</SelectItem>
                <SelectItem value="extended">Extended Panel</SelectItem>
                <SelectItem value="custom">Custom Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Urgency Level <span className="text-red-500">*</span></Label>
            <Select value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency..." />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Include dietary restrictions, pre-test conditions, etc."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ownerConsent"
                checked={formData.ownerConsent}
                onCheckedChange={(checked) => handleInputChange('ownerConsent', checked as boolean)}
              />
              <Label htmlFor="ownerConsent">
                Owner consent obtained <span className="text-red-500">*</span>
              </Label>
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
