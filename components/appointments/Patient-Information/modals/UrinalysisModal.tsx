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

interface UrinalysisModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface UrinalysisFormData {
  sampleType: string
  collectionTime: string
  sampleVolume: string
  sampleColor: string
  testRequested: string
  clinicalSigns: string
  urgencyLevel: string
  specialInstructions: string
  fastingStatus: boolean
  ownerConsent: boolean
}

export default function UrinalysisModal({ open, onClose, patientId, appointmentId }: UrinalysisModalProps) {
  const [formData, setFormData] = useState<UrinalysisFormData>({
    sampleType: "",
    collectionTime: new Date().toISOString().slice(0, 16),
    sampleVolume: "",
    sampleColor: "",
    testRequested: "",
    clinicalSigns: "",
    urgencyLevel: "",
    specialInstructions: "",
    fastingStatus: false,
    ownerConsent: false
  })

  const urgencyLevels = [
    { value: "routine", label: "Routine", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "urgent", label: "Urgent", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-800 border-red-200" }
  ]

  const handleInputChange = (field: keyof UrinalysisFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = ['sampleType', 'collectionTime', 'testRequested', 'urgencyLevel']
    const missingFields = requiredFields.filter(field => !formData[field as keyof UrinalysisFormData])
    
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
      console.log('Urinalysis Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "DIAURI002"
      })
      
      toast.success("Urinalysis procedure registered successfully!")
      
      // Reset form and close modal
      setFormData({
        sampleType: "",
        collectionTime: new Date().toISOString().slice(0, 16),
        sampleVolume: "",
        sampleColor: "",
        testRequested: "",
        clinicalSigns: "",
        urgencyLevel: "",
        specialInstructions: "",
        fastingStatus: false,
        ownerConsent: false
      })
      
      onClose()
    } catch (error) {
      toast.error("Failed to register urinalysis procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🧪 Urinalysis Documentation
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
              <Label htmlFor="sampleType">
                Sample Collection Method <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.sampleType} onValueChange={(value) => handleInputChange('sampleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free-catch">Free Catch</SelectItem>
                  <SelectItem value="catheterization">Catheterization</SelectItem>
                  <SelectItem value="cystocentesis">Cystocentesis</SelectItem>
                  <SelectItem value="manual-expression">Manual Expression</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectionTime">
                Collection Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.collectionTime}
                onChange={(e) => handleInputChange('collectionTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sampleVolume">Sample Volume (ml)</Label>
              <Input
                type="number"
                value={formData.sampleVolume}
                onChange={(e) => handleInputChange('sampleVolume', e.target.value)}
                min="0"
                step="0.1"
                placeholder="e.g., 5.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleColor">Sample Color/Appearance</Label>
              <Select value={formData.sampleColor} onValueChange={(value) => handleInputChange('sampleColor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appearance..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear-yellow">Clear Yellow</SelectItem>
                  <SelectItem value="pale-yellow">Pale Yellow</SelectItem>
                  <SelectItem value="dark-yellow">Dark Yellow</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="red-blood">Red/Bloody</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="testRequested">
              Tests Requested <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.testRequested} onValueChange={(value) => handleInputChange('testRequested', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select test type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine Urinalysis</SelectItem>
                <SelectItem value="complete">Complete Urinalysis + Microscopy</SelectItem>
                <SelectItem value="culture">Urinalysis + Culture & Sensitivity</SelectItem>
                <SelectItem value="protein">Protein/Microalbumin Focus</SelectItem>
                <SelectItem value="crystals">Crystal Analysis</SelectItem>
                <SelectItem value="custom">Custom Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalSigns">Clinical Signs/Symptoms</Label>
            <Textarea
              value={formData.clinicalSigns}
              onChange={(e) => handleInputChange('clinicalSigns', e.target.value)}
              placeholder="Describe any observed symptoms: frequent urination, blood in urine, difficulty urinating, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special handling requirements or additional notes for the lab..."
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
              <Label htmlFor="fastingStatus">Pet was fasting at time of collection</Label>
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