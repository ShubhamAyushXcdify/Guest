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

interface AcupunctureModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

interface AcupunctureFormData {
  therapyType: string
  primaryCondition: string
  secondaryConditions: string[]
  painLevel: string
  mobilityScore: string
  acupuncturePoints: string[]
  needleType: string
  needleRetentionTime: string
  electroStimulation: boolean
  stimulationParameters: string
  physiotherapyTechniques: string[]
  exerciseProgram: string
  treatmentDuration: string
  treatmentFrequency: string
  previousTreatments: string
  contraindications: string
  currentMedications: string
  treatmentResponse: string
  homeExercises: string
  heatTherapy: boolean
  coldTherapy: boolean
  massageTherapy: boolean
  treatmentDate: string
  nextSessionDate: string
  treatingTherapist: string
  ownerConsent: boolean
  notes: string
}

export default function AcupunctureModal({ open, onClose, patientId, appointmentId }: AcupunctureModalProps) {
  const [formData, setFormData] = useState<AcupunctureFormData>({
    therapyType: "",
    primaryCondition: "",
    secondaryConditions: [],
    painLevel: "",
    mobilityScore: "",
    acupuncturePoints: [],
    needleType: "",
    needleRetentionTime: "",
    electroStimulation: false,
    stimulationParameters: "",
    physiotherapyTechniques: [],
    exerciseProgram: "",
    treatmentDuration: "",
    treatmentFrequency: "",
    previousTreatments: "",
    contraindications: "",
    currentMedications: "",
    treatmentResponse: "",
    homeExercises: "",
    heatTherapy: false,
    coldTherapy: false,
    massageTherapy: false,
    treatmentDate: new Date().toISOString().slice(0, 16),
    nextSessionDate: "",
    treatingTherapist: "",
    ownerConsent: false,
    notes: ""
  })

  const therapyTypes = [
    { value: "dry-needling", label: "Dry Needling" },
    { value: "electroacupuncture", label: "Electroacupuncture" },
    { value: "aquapuncture", label: "Aquapuncture" },
    { value: "laser-acupuncture", label: "Laser Acupuncture" }
  ]

  const conditions = [
    { value: "arthritis", label: "Arthritis" },
    { value: "hip-dysplasia", label: "Hip Dysplasia" },
    { value: "disc-disease", label: "Disc Disease" },
    { value: "muscle-strain", label: "Muscle Strain" },
    { value: "nerve-pain", label: "Nerve Pain" },
    { value: "post-surgical", label: "Post-Surgical Recovery" }
  ]

  const painLevels = [
    { value: "mild", label: "Mild (1-3)" },
    { value: "moderate", label: "Moderate (4-6)" },
    { value: "severe", label: "Severe (7-8)" },
    { value: "extreme", label: "Extreme (9-10)" }
  ]

  const mobilityScores = [
    { value: "normal", label: "Normal Mobility" },
    { value: "mild", label: "Mild Limitation" },
    { value: "moderate", label: "Moderate Limitation" },
    { value: "severe", label: "Severe Limitation" }
  ]

  const acupuncturePoints = [
    { value: "gb29-30", label: "GB 29-30 (Hip)" },
    { value: "bl23-25", label: "BL 23-25 (Back)" },
    { value: "st36", label: "ST 36 (Knee)" },
    { value: "li4", label: "LI 4 (General Pain)" },
    { value: "gb34", label: "GB 34 (Joints)" },
    { value: "bai-hui", label: "Bai Hui (Back)" }
  ]

  const needleTypes = [
    { value: "0.16x15", label: "0.16 x 15mm" },
    { value: "0.20x25", label: "0.20 x 25mm" },
    { value: "0.25x30", label: "0.25 x 30mm" },
    { value: "0.30x40", label: "0.30 x 40mm" }
  ]

  const physiotherapyTechniques = [
    { value: "passive-rom", label: "Passive ROM" },
    { value: "active-rom", label: "Active ROM" },
    { value: "stretching", label: "Stretching" },
    { value: "strengthening", label: "Strengthening" },
    { value: "balance", label: "Balance Exercises" },
    { value: "gait-training", label: "Gait Training" }
  ]

  const handleInputChange = (field: keyof AcupunctureFormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate required fields
    const requiredFields = [
      'therapyType',
      'primaryCondition',
      'painLevel',
      'mobilityScore',
      'treatmentDuration',
      'treatmentFrequency',
      'treatmentDate',
      'nextSessionDate',
      'treatingTherapist'
    ]
    const missingFields = requiredFields.filter(field => !formData[field as keyof AcupunctureFormData])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!formData.ownerConsent) {
      toast.error("Owner consent is required")
      return
    }

    if (formData.acupuncturePoints.length === 0) {
      toast.error("At least one acupuncture point must be selected")
      return
    }

    try {
      // Here you would typically send the data to your API
      console.log('Acupuncture/Physiotherapy Registration Data:', {
        ...formData,
        patientId,
        appointmentId,
        procedureCode: "THEACU004"
      })
      
      toast.success("Acupuncture/physiotherapy session registered successfully!")
      
      // Reset form and close modal
      setFormData({
        therapyType: "",
        primaryCondition: "",
        secondaryConditions: [],
        painLevel: "",
        mobilityScore: "",
        acupuncturePoints: [],
        needleType: "",
        needleRetentionTime: "",
        electroStimulation: false,
        stimulationParameters: "",
        physiotherapyTechniques: [],
        exerciseProgram: "",
        treatmentDuration: "",
        treatmentFrequency: "",
        previousTreatments: "",
        contraindications: "",
        currentMedications: "",
        treatmentResponse: "",
        homeExercises: "",
        heatTherapy: false,
        coldTherapy: false,
        massageTherapy: false,
        treatmentDate: new Date().toISOString().slice(0, 16),
        nextSessionDate: "",
        treatingTherapist: "",
        ownerConsent: false,
        notes: ""
      })
      
      onClose()
    } catch (error) {
      toast.error("Failed to register acupuncture/physiotherapy session")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            🪄 Acupuncture/Physiotherapy Documentation
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
              <Label htmlFor="therapyType">
                Therapy Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.therapyType} onValueChange={(value) => handleInputChange('therapyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select therapy type..." />
                </SelectTrigger>
                <SelectContent>
                  {therapyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryCondition">
                Primary Condition <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.primaryCondition} onValueChange={(value) => handleInputChange('primaryCondition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition..." />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary Conditions</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {conditions.map(condition => (
                <div key={condition.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition.value}`}
                    checked={formData.secondaryConditions.includes(condition.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('secondaryConditions', [...formData.secondaryConditions, condition.value])
                      } else {
                        handleInputChange('secondaryConditions', formData.secondaryConditions.filter(c => c !== condition.value))
                      }
                    }}
                  />
                  <Label htmlFor={`condition-${condition.value}`}>{condition.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="painLevel">
                Pain Level <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.painLevel} onValueChange={(value) => handleInputChange('painLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pain level..." />
                </SelectTrigger>
                <SelectContent>
                  {painLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobilityScore">
                Mobility Score <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.mobilityScore} onValueChange={(value) => handleInputChange('mobilityScore', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mobility score..." />
                </SelectTrigger>
                <SelectContent>
                  {mobilityScores.map(score => (
                    <SelectItem key={score.value} value={score.value}>{score.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Acupuncture Points <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {acupuncturePoints.map(point => (
                <div key={point.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`point-${point.value}`}
                    checked={formData.acupuncturePoints.includes(point.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('acupuncturePoints', [...formData.acupuncturePoints, point.value])
                      } else {
                        handleInputChange('acupuncturePoints', formData.acupuncturePoints.filter(p => p !== point.value))
                      }
                    }}
                  />
                  <Label htmlFor={`point-${point.value}`}>{point.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="needleType">Needle Type</Label>
              <Select value={formData.needleType} onValueChange={(value) => handleInputChange('needleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select needle type..." />
                </SelectTrigger>
                <SelectContent>
                  {needleTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="needleRetentionTime">Needle Retention Time</Label>
              <Input
                type="text"
                value={formData.needleRetentionTime}
                onChange={(e) => handleInputChange('needleRetentionTime', e.target.value)}
                placeholder="e.g., 20 minutes"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electroStimulation"
                checked={formData.electroStimulation}
                onCheckedChange={(checked) => handleInputChange('electroStimulation', checked as boolean)}
              />
              <Label htmlFor="electroStimulation">Electrostimulation Used</Label>
            </div>

            {formData.electroStimulation && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="stimulationParameters">Stimulation Parameters</Label>
                <Input
                  value={formData.stimulationParameters}
                  onChange={(e) => handleInputChange('stimulationParameters', e.target.value)}
                  placeholder="Enter stimulation parameters"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Physiotherapy Techniques</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {physiotherapyTechniques.map(technique => (
                <div key={technique.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`technique-${technique.value}`}
                    checked={formData.physiotherapyTechniques.includes(technique.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleInputChange('physiotherapyTechniques', [...formData.physiotherapyTechniques, technique.value])
                      } else {
                        handleInputChange('physiotherapyTechniques', formData.physiotherapyTechniques.filter(t => t !== technique.value))
                      }
                    }}
                  />
                  <Label htmlFor={`technique-${technique.value}`}>{technique.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentDuration">
                Treatment Duration <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.treatmentDuration}
                onChange={(e) => handleInputChange('treatmentDuration', e.target.value)}
                placeholder="Enter duration"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentFrequency">
                Treatment Frequency <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.treatmentFrequency}
                onChange={(e) => handleInputChange('treatmentFrequency', e.target.value)}
                placeholder="e.g., Weekly"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Therapies</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="heatTherapy"
                  checked={formData.heatTherapy}
                  onCheckedChange={(checked) => handleInputChange('heatTherapy', checked as boolean)}
                />
                <Label htmlFor="heatTherapy">Heat Therapy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coldTherapy"
                  checked={formData.coldTherapy}
                  onCheckedChange={(checked) => handleInputChange('coldTherapy', checked as boolean)}
                />
                <Label htmlFor="coldTherapy">Cold Therapy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="massageTherapy"
                  checked={formData.massageTherapy}
                  onCheckedChange={(checked) => handleInputChange('massageTherapy', checked as boolean)}
                />
                <Label htmlFor="massageTherapy">Massage Therapy</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseProgram">Exercise Program</Label>
            <Textarea
              value={formData.exerciseProgram}
              onChange={(e) => handleInputChange('exerciseProgram', e.target.value)}
              placeholder="Detail the exercise program..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeExercises">Home Exercises</Label>
            <Textarea
              value={formData.homeExercises}
              onChange={(e) => handleInputChange('homeExercises', e.target.value)}
              placeholder="Detail exercises to be performed at home..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousTreatments">Previous Treatments</Label>
            <Textarea
              value={formData.previousTreatments}
              onChange={(e) => handleInputChange('previousTreatments', e.target.value)}
              placeholder="Document previous treatments and responses..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contraindications">Contraindications</Label>
            <Textarea
              value={formData.contraindications}
              onChange={(e) => handleInputChange('contraindications', e.target.value)}
              placeholder="List any contraindications..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              value={formData.currentMedications}
              onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              placeholder="List current medications..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentResponse">Treatment Response</Label>
            <Textarea
              value={formData.treatmentResponse}
              onChange={(e) => handleInputChange('treatmentResponse', e.target.value)}
              placeholder="Document response to treatment..."
              rows={2}
            />
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
              <Label htmlFor="nextSessionDate">
                Next Session Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.nextSessionDate}
                onChange={(e) => handleInputChange('nextSessionDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatingTherapist">
              Treating Therapist <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={formData.treatingTherapist}
              onChange={(e) => handleInputChange('treatingTherapist', e.target.value)}
              placeholder="Name of therapist"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any other relevant notes about the treatment..."
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
                Owner consent obtained for treatment <span className="text-red-500">*</span>
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