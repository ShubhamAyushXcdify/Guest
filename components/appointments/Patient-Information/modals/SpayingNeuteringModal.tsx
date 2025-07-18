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

interface SpayingNeuteringModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface SpayingNeuteringFormData {
  animalName: string
  age: string
  sex: string
  breed: string
  weight: string
  procedureType: string
  notes: string
  fastingStatus: boolean
  ownerConsent: boolean
}

export default function SpayingNeuteringModal({ open, onClose, patientId, appointmentId }: SpayingNeuteringModalProps) {
  const [formData, setFormData] = useState<SpayingNeuteringFormData>({
    animalName: "",
    age: "",
    sex: "",
    breed: "",
    weight: "",
    procedureType: "",
    notes: "",
    fastingStatus: false,
    ownerConsent: false
  })

  const procedureTypes = [
    { value: "spaying", label: "Spaying (Ovariohysterectomy)" },
    { value: "neutering", label: "Neutering (Castration)" }
  ]

  const handleInputChange = (field: keyof SpayingNeuteringFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const requiredFields = ['animalName', 'age', 'sex', 'breed', 'weight', 'procedureType']
    const missingFields = requiredFields.filter(field => !formData[field as keyof SpayingNeuteringFormData])

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
      console.log('Spaying/Neutering Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "PRESPA004"
      })

      toast.success("Spaying/Neutering procedure registered successfully!")

      // Reset form and close modal
      setFormData({
        animalName: "",
        age: "",
        sex: "",
        breed: "",
        weight: "",
        procedureType: "",
        notes: "",
        fastingStatus: false,
        ownerConsent: false
      })

      onClose()
    } catch (error) {
      toast.error("Failed to register spaying/neutering procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🐾 Spaying/Neutering Documentation
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
            <strong>Info:</strong> Pet and client information will be automatically linked from the existing appointment record.<br/>
            <strong>Procedure:</strong> Surgical sterilization to prevent reproduction.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animalName">
                Animal Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="animalName"
                value={formData.animalName}
                onChange={(e) => handleInputChange('animalName', e.target.value)}
                placeholder="Enter animal's name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">
                Age <span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="e.g., 2 years"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex">
                Sex <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sex"
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                placeholder="Male or Female"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">
                Breed <span className="text-red-500">*</span>
              </Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                placeholder="e.g., Labrador Retriever"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                min="0"
                step="0.1"
                placeholder="e.g., 12.5"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="procedureType">
                Procedure Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="procedureType"
                className="w-full border rounded px-3 py-2"
                value={formData.procedureType}
                onChange={(e) => handleInputChange('procedureType', e.target.value)}
                required
              >
                <option value="" disabled>Select procedure...</option>
                {procedureTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or instructions..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fastingStatus"
                checked={formData.fastingStatus}
                onCheckedChange={(checked) => handleInputChange('fastingStatus', checked as boolean)}
              />
              <Label htmlFor="fastingStatus">Pet was fasting prior to procedure</Label>
            </div>
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