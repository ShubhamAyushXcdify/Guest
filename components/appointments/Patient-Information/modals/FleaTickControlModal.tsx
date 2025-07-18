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

interface FleaTickControlModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
  procedureId?: string
}

interface FleaTickControlFormData {
  productName: string
  productType: string
  dosage: string
  applicationMethod: string
  applicationDateTime: string
  nextDueDate: string
  ownerConsent: boolean
  notes: string
}

export default function FleaTickControlModal({ open, onClose, patientId, appointmentId }: FleaTickControlModalProps) {
  const [formData, setFormData] = useState<FleaTickControlFormData>({
    productName: "",
    productType: "",
    dosage: "",
    applicationMethod: "",
    applicationDateTime: new Date().toISOString().slice(0, 16),
    nextDueDate: "",
    ownerConsent: false,
    notes: ""
  })

  const productTypes = [
    { value: "topical", label: "Topical" },
    { value: "oral", label: "Oral" },
    { value: "collar", label: "Collar" },
    { value: "spray", label: "Spray" },
    { value: "other", label: "Other" }
  ]

  const applicationMethods = [
    { value: "topical-application", label: "Topical Application" },
    { value: "oral-administration", label: "Oral Administration" },
    { value: "collar-fitting", label: "Collar Fitting" },
    { value: "spray-application", label: "Spray Application" },
    { value: "other", label: "Other" }
  ]

  const handleInputChange = (field: keyof FleaTickControlFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = ['productName', 'productType', 'dosage', 'applicationMethod', 'applicationDateTime']
    const missingFields = requiredFields.filter(field => !formData[field as keyof FleaTickControlFormData])
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
      console.log('Flea/Tick Control Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "PREFLE003"
      })
      toast.success("Flea/Tick control procedure registered successfully!")
      // Reset form and close modal
      setFormData({
        productName: "",
        productType: "",
        dosage: "",
        applicationMethod: "",
        applicationDateTime: new Date().toISOString().slice(0, 16),
        nextDueDate: "",
        ownerConsent: false,
        notes: ""
      })
      onClose()
    } catch (error) {
      toast.error("Failed to register flea/tick control procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🐛 Flea/Tick Control Documentation
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
              <Label htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productType">
                Product Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">
                Dosage <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder="e.g., 1 tablet, 1ml, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationMethod">
                Application Method <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.applicationMethod} onValueChange={(value) => handleInputChange('applicationMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  {applicationMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDateTime">
                Application Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.applicationDateTime}
                onChange={(e) => handleInputChange('applicationDateTime', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                placeholder="Next application date"
              />
            </div>
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