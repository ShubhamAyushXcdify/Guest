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

interface MicrochippingModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface MicrochippingFormData {
  chipNumber: string
  manufacturer: string
  implantationSite: string
  implantationDateTime: string
  implanter: string
  ownerConsent: boolean
  notes: string
}

export default function MicrochippingModal({ open, onClose, patientId, appointmentId }: MicrochippingModalProps) {
  const [formData, setFormData] = useState<MicrochippingFormData>({
    chipNumber: "",
    manufacturer: "",
    implantationSite: "",
    implantationDateTime: new Date().toISOString().slice(0, 16),
    implanter: "",
    ownerConsent: false,
    notes: ""
  })

  const manufacturers = [
    { value: "avid", label: "AVID" },
    { value: "homeagain", label: "HomeAgain" },
    { value: "datamars", label: "Datamars" },
    { value: "trovan", label: "Trovan" },
    { value: "other", label: "Other" }
  ]

  const implantationSites = [
    { value: "scruff", label: "Scruff of Neck" },
    { value: "shoulder", label: "Shoulder Area" },
    { value: "other", label: "Other" }
  ]

  const handleInputChange = (field: keyof MicrochippingFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = ['chipNumber', 'manufacturer', 'implantationSite', 'implantationDateTime', 'implanter']
    const missingFields = requiredFields.filter(field => !formData[field as keyof MicrochippingFormData])
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
      console.log('Microchipping Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "PREMIC006"
      })
      toast.success("Microchipping procedure registered successfully!")
      // Reset form and close modal
      setFormData({
        chipNumber: "",
        manufacturer: "",
        implantationSite: "",
        implantationDateTime: new Date().toISOString().slice(0, 16),
        implanter: "",
        ownerConsent: false,
        notes: ""
      })
      onClose()
    } catch (error) {
      toast.error("Failed to register microchipping procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🏷️ Microchipping Documentation
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
              <Label htmlFor="chipNumber">
                Microchip Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.chipNumber}
                onChange={(e) => handleInputChange('chipNumber', e.target.value)}
                placeholder="Enter microchip number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">
                Manufacturer <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.manufacturer} onValueChange={(value) => handleInputChange('manufacturer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer..." />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="implantationSite">
                Implantation Site <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.implantationSite} onValueChange={(value) => handleInputChange('implantationSite', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  {implantationSites.map(site => (
                    <SelectItem key={site.value} value={site.value}>{site.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="implantationDateTime">
                Implantation Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.implantationDateTime}
                onChange={(e) => handleInputChange('implantationDateTime', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="implanter">
              Implanter <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.implanter}
              onChange={(e) => handleInputChange('implanter', e.target.value)}
              placeholder="Name of person who implanted"
              required
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