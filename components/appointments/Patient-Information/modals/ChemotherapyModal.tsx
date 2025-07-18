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

interface ChemotherapyModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface ChemotherapyFormData {
  protocolName: string
  cycleNumber: string
  drugNames: string[]
  dosageCalculation: string
  weight: string
  bodyArea: string
  drugDosages: string
  administrationRoute: string
  premedications: string[]
  bloodworkDate: string
  wbc: string
  plateletCount: string
  kidneyValues: string
  liverValues: string
  previousReactions: string
  portAccess: boolean
  portMaintenanceDate: string
  extravasationRisk: string
  handlingPrecautions: boolean
  treatmentDate: string
  nextDueDate: string
  administeredBy: string
  supervisingVet: string
  postTreatmentCare: string
  ownerConsent: boolean
  notes: string
}

export default function ChemotherapyModal({ open, onClose, patientId, appointmentId }: ChemotherapyModalProps) {
  const [formData, setFormData] = useState<ChemotherapyFormData>({
    protocolName: "",
    cycleNumber: "",
    drugNames: [],
    dosageCalculation: "",
    weight: "",
    bodyArea: "",
    drugDosages: "",
    administrationRoute: "",
    premedications: [],
    bloodworkDate: "",
    wbc: "",
    plateletCount: "",
    kidneyValues: "",
    liverValues: "",
    previousReactions: "",
    portAccess: false,
    portMaintenanceDate: "",
    extravasationRisk: "",
    handlingPrecautions: false,
    treatmentDate: new Date().toISOString().slice(0, 16),
    nextDueDate: "",
    administeredBy: "",
    supervisingVet: "",
    postTreatmentCare: "",
    ownerConsent: false,
    notes: ""
  })

  const protocols = [
    { value: "madison-wisconsin", label: "Madison-Wisconsin Protocol" },
    { value: "chop", label: "CHOP Protocol" },
    { value: "single-agent", label: "Single Agent Protocol" },
    { value: "metronomic", label: "Metronomic Protocol" },
    { value: "custom", label: "Custom Protocol" }
  ]

  const chemoDrugs = [
    { value: "vincristine", label: "Vincristine" },
    { value: "doxorubicin", label: "Doxorubicin" },
    { value: "cyclophosphamide", label: "Cyclophosphamide" },
    { value: "prednisone", label: "Prednisone" },
    { value: "l-asparaginase", label: "L-asparaginase" },
    { value: "carboplatin", label: "Carboplatin" }
  ]

  const premedsList = [
    { value: "maropitant", label: "Maropitant (Cerenia)" },
    { value: "ondansetron", label: "Ondansetron" },
    { value: "diphenhydramine", label: "Diphenhydramine" },
    { value: "dexamethasone", label: "Dexamethasone" }
  ]

  const routes = [
    { value: "iv", label: "Intravenous" },
    { value: "sc", label: "Subcutaneous" },
    { value: "oral", label: "Oral" },
    { value: "im", label: "Intramuscular" }
  ]

  const riskLevels = [
    { value: "low", label: "Low Risk" },
    { value: "moderate", label: "Moderate Risk" },
    { value: "high", label: "High Risk" },
    { value: "severe", label: "Severe Risk" }
  ]

  const handleInputChange = (field: keyof ChemotherapyFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = [
      'protocolName',
      'cycleNumber',
      'weight',
      'drugDosages',
      'administrationRoute',
      'bloodworkDate',
      'wbc',
      'plateletCount',
      'treatmentDate',
      'nextDueDate',
      'administeredBy',
      'supervisingVet'
    ]
    const missingFields = requiredFields.filter(field => !formData[field as keyof ChemotherapyFormData])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    if (formData.drugNames.length === 0) {
      toast.error("At least one chemotherapy drug must be selected")
      return
    }

    if (!formData.handlingPrecautions) {
      toast.error("Handling precautions must be acknowledged")
      return
    }

    try {
      // Here you would typically send the data to your API
      console.log('Chemotherapy Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "THECHE008"
      })
      
      toast.success("Chemotherapy procedure registered successfully!")
      
      // Reset form and close modal
      setFormData({
        protocolName: "",
        cycleNumber: "",
        drugNames: [],
        dosageCalculation: "",
        weight: "",
        bodyArea: "",
        drugDosages: "",
        administrationRoute: "",
        premedications: [],
        bloodworkDate: "",
        wbc: "",
        plateletCount: "",
        kidneyValues: "",
        liverValues: "",
        previousReactions: "",
        portAccess: false,
        portMaintenanceDate: "",
        extravasationRisk: "",
        handlingPrecautions: false,
        treatmentDate: new Date().toISOString().slice(0, 16),
        nextDueDate: "",
        administeredBy: "",
        supervisingVet: "",
        postTreatmentCare: "",
        ownerConsent: false,
        notes: ""
      })
      
      onClose()
    } catch (error) {
      toast.error("Failed to register chemotherapy procedure")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            💊 Chemotherapy Documentation
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
              <Label htmlFor="protocolName">
                Protocol Name <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.protocolName} onValueChange={(value) => handleInputChange('protocolName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select protocol..." />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map(protocol => (
                    <SelectItem key={protocol.value} value={protocol.value}>{protocol.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycleNumber">
                Cycle Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.cycleNumber}
                onChange={(e) => handleInputChange('cycleNumber', e.target.value)}
                placeholder="e.g., Cycle 1 of 4"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chemotherapy Drugs <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {chemoDrugs.map(drug => (
                <div key={drug.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`drug-${drug.value}`}
                    checked={formData.drugNames.includes(drug.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('drugNames', [...formData.drugNames, drug.value])
                      } else {
                        handleInputChange('drugNames', formData.drugNames.filter(d => d !== drug.value))
                      }
                    }}
                  />
                  <Label htmlFor={`drug-${drug.value}`}>{drug.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyArea">Body Surface Area (m²)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.bodyArea}
                onChange={(e) => handleInputChange('bodyArea', e.target.value)}
                placeholder="Enter BSA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="administrationRoute">
                Administration Route <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.administrationRoute} onValueChange={(value) => handleInputChange('administrationRoute', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route..." />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route.value} value={route.value}>{route.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drugDosages">
              Drug Dosages <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.drugDosages}
              onChange={(e) => handleInputChange('drugDosages', e.target.value)}
              placeholder="Enter detailed drug dosages and calculations..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Premedications</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {premedsList.map(med => (
                <div key={med.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`premed-${med.value}`}
                    checked={formData.premedications.includes(med.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('premedications', [...formData.premedications, med.value])
                      } else {
                        handleInputChange('premedications', formData.premedications.filter(m => m !== med.value))
                      }
                    }}
                  />
                  <Label htmlFor={`premed-${med.value}`}>{med.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodworkDate">
                Bloodwork Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.bloodworkDate}
                onChange={(e) => handleInputChange('bloodworkDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extravasationRisk">Extravasation Risk</Label>
              <Select value={formData.extravasationRisk} onValueChange={(value) => handleInputChange('extravasationRisk', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level..." />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map(risk => (
                    <SelectItem key={risk.value} value={risk.value}>{risk.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wbc">
                WBC Count <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.wbc}
                onChange={(e) => handleInputChange('wbc', e.target.value)}
                placeholder="Enter WBC count"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plateletCount">
                Platelet Count <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.plateletCount}
                onChange={(e) => handleInputChange('plateletCount', e.target.value)}
                placeholder="Enter platelet count"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kidneyValues">Kidney Values</Label>
              <Input
                type="text"
                value={formData.kidneyValues}
                onChange={(e) => handleInputChange('kidneyValues', e.target.value)}
                placeholder="Enter kidney values"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="liverValues">Liver Values</Label>
              <Input
                type="text"
                value={formData.liverValues}
                onChange={(e) => handleInputChange('liverValues', e.target.value)}
                placeholder="Enter liver values"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentDate">
                Treatment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={formData.treatmentDate}
                onChange={(e) => handleInputChange('treatmentDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDueDate">
                Next Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="administeredBy">
                Administered By <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.administeredBy}
                onChange={(e) => handleInputChange('administeredBy', e.target.value)}
                placeholder="Name of administrator"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisingVet">
                Supervising Veterinarian <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.supervisingVet}
                onChange={(e) => handleInputChange('supervisingVet', e.target.value)}
                placeholder="Name of supervising vet"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousReactions">Previous Reactions</Label>
            <Textarea
              value={formData.previousReactions}
              onChange={(e) => handleInputChange('previousReactions', e.target.value)}
              placeholder="Document any previous reactions to chemotherapy..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postTreatmentCare">Post-Treatment Care Instructions</Label>
            <Textarea
              value={formData.postTreatmentCare}
              onChange={(e) => handleInputChange('postTreatmentCare', e.target.value)}
              placeholder="Enter post-treatment care instructions..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any other relevant notes about the chemotherapy procedure..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="portAccess"
                checked={formData.portAccess}
                onCheckedChange={(checked) => handleInputChange('portAccess', checked as boolean)}
              />
              <Label htmlFor="portAccess">Port access device present</Label>
            </div>

            {formData.portAccess && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="portMaintenanceDate">Last Port Maintenance</Label>
                <Input
                  type="date"
                  value={formData.portMaintenanceDate}
                  onChange={(e) => handleInputChange('portMaintenanceDate', e.target.value)}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="handlingPrecautions"
                checked={formData.handlingPrecautions}
                onCheckedChange={(checked) => handleInputChange('handlingPrecautions', checked as boolean)}
                required
              />
              <Label htmlFor="handlingPrecautions">
                Safety handling precautions acknowledged <span className="text-red-500">*</span>
              </Label>
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