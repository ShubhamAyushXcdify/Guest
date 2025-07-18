"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface DentalExtractionsModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

export default function DentalExtractionsModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: DentalExtractionsModalProps) {
  // Form state
  const [teethExtracted, setTeethExtracted] = useState("")
  const [extractionReason, setExtractionReason] = useState("")
  const [preOpXrays, setPreOpXrays] = useState(false)
  const [xrayFindings, setXrayFindings] = useState("")
  const [anesthesiaType, setAnesthesiaType] = useState("")
  const [localAnesthetic, setLocalAnesthetic] = useState("")
  const [extractionTechnique, setExtractionTechnique] = useState("")
  const [flapsCreated, setFlapsCreated] = useState(false)
  const [flapDetails, setFlapDetails] = useState("")
  const [boneLoss, setBoneLoss] = useState(false)
  const [boneLossDetails, setBoneLossDetails] = useState("")
  const [rootFracture, setRootFracture] = useState(false)
  const [rootFragmentDetails, setRootFragmentDetails] = useState("")
  const [closureTechnique, setClosureTechnique] = useState("")
  const [sutureMaterial, setSutureMaterial] = useState("")
  const [hemorrhageControl, setHemorrhageControl] = useState("")
  const [complications, setComplications] = useState("")
  const [postOpXrays, setPostOpXrays] = useState(false)
  const [postOpXrayFindings, setPostOpXrayFindings] = useState("")
  const [medications, setMedications] = useState("")
  const [painControl, setPainControl] = useState("")
  const [antibiotics, setAntibiotics] = useState("")
  const [homeInstructions, setHomeInstructions] = useState("")
  const [dietaryRestrictions, setDietaryRestrictions] = useState("")
  const [followUpPlan, setFollowUpPlan] = useState("")
  const [healingProgress, setHealingProgress] = useState("")
  const [dentalChartNotes, setDentalChartNotes] = useState("")
  const [consentObtained, setConsentObtained] = useState(false)
  const [surgeonName, setSurgeonName] = useState("")
  const [assistantName, setAssistantName] = useState("")

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!consentObtained) {
      toast.error("Owner consent is required before proceeding")
      return
    }

    if (!teethExtracted || !anesthesiaType || !surgeonName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // TODO: Implement API call to save dental extraction documentation
      toast.success("Dental extraction documentation saved successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save dental extraction documentation")
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dental Extraction Documentation</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="teethExtracted">Teeth Extracted *</Label>
              <Textarea
                id="teethExtracted"
                value={teethExtracted}
                onChange={(e) => setTeethExtracted(e.target.value)}
                placeholder="List teeth numbers extracted"
                required
              />
            </div>

            <div>
              <Label htmlFor="extractionReason">Reason for Extraction</Label>
              <Select value={extractionReason} onValueChange={setExtractionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="periodontal">Periodontal Disease</SelectItem>
                  <SelectItem value="fracture">Tooth Fracture</SelectItem>
                  <SelectItem value="abscess">Dental Abscess</SelectItem>
                  <SelectItem value="resorption">Tooth Resorption</SelectItem>
                  <SelectItem value="malposition">Malpositioned Tooth</SelectItem>
                  <SelectItem value="overcrowding">Overcrowding</SelectItem>
                  <SelectItem value="neoplasia">Oral Neoplasia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="preOpXrays"
                checked={preOpXrays}
                onCheckedChange={(checked) => setPreOpXrays(checked as boolean)}
              />
              <Label htmlFor="preOpXrays">Pre-operative X-rays Taken</Label>
            </div>

            {preOpXrays && (
              <div>
                <Label htmlFor="xrayFindings">X-ray Findings</Label>
                <Textarea
                  id="xrayFindings"
                  value={xrayFindings}
                  onChange={(e) => setXrayFindings(e.target.value)}
                  placeholder="Describe radiographic findings"
                />
              </div>
            )}

            <div>
              <Label htmlFor="anesthesiaType">Anesthesia Type *</Label>
              <Select value={anesthesiaType} onValueChange={setAnesthesiaType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthesia type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Anesthesia</SelectItem>
                  <SelectItem value="sedation">Heavy Sedation</SelectItem>
                  <SelectItem value="local">Local Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="localAnesthetic">Local Anesthetic Used</Label>
              <Input
                id="localAnesthetic"
                value={localAnesthetic}
                onChange={(e) => setLocalAnesthetic(e.target.value)}
                placeholder="Type and location of local anesthetic"
              />
            </div>

            <div>
              <Label htmlFor="extractionTechnique">Extraction Technique</Label>
              <Select value={extractionTechnique} onValueChange={setExtractionTechnique}>
                <SelectTrigger>
                  <SelectValue placeholder="Select technique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Extraction</SelectItem>
                  <SelectItem value="surgical">Surgical Extraction</SelectItem>
                  <SelectItem value="sectioning">Crown Sectioning</SelectItem>
                  <SelectItem value="flap">Flap and Extraction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flapsCreated"
                checked={flapsCreated}
                onCheckedChange={(checked) => setFlapsCreated(checked as boolean)}
              />
              <Label htmlFor="flapsCreated">Gingival Flaps Created</Label>
            </div>

            {flapsCreated && (
              <div>
                <Label htmlFor="flapDetails">Flap Details</Label>
                <Textarea
                  id="flapDetails"
                  value={flapDetails}
                  onChange={(e) => setFlapDetails(e.target.value)}
                  placeholder="Describe flap design and technique"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="boneLoss"
                checked={boneLoss}
                onCheckedChange={(checked) => setBoneLoss(checked as boolean)}
              />
              <Label htmlFor="boneLoss">Significant Bone Loss Present</Label>
            </div>

            {boneLoss && (
              <div>
                <Label htmlFor="boneLossDetails">Bone Loss Details</Label>
                <Textarea
                  id="boneLossDetails"
                  value={boneLossDetails}
                  onChange={(e) => setBoneLossDetails(e.target.value)}
                  placeholder="Describe extent and location of bone loss"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rootFracture"
                checked={rootFracture}
                onCheckedChange={(checked) => setRootFracture(checked as boolean)}
              />
              <Label htmlFor="rootFracture">Root Fracture Occurred</Label>
            </div>

            {rootFracture && (
              <div>
                <Label htmlFor="rootFragmentDetails">Root Fragment Details</Label>
                <Textarea
                  id="rootFragmentDetails"
                  value={rootFragmentDetails}
                  onChange={(e) => setRootFragmentDetails(e.target.value)}
                  placeholder="Describe management of root fragments"
                />
              </div>
            )}

            <div>
              <Label htmlFor="closureTechnique">Closure Technique</Label>
              <Input
                id="closureTechnique"
                value={closureTechnique}
                onChange={(e) => setClosureTechnique(e.target.value)}
                placeholder="Describe closure method"
              />
            </div>

            <div>
              <Label htmlFor="sutureMaterial">Suture Material</Label>
              <Input
                id="sutureMaterial"
                value={sutureMaterial}
                onChange={(e) => setSutureMaterial(e.target.value)}
                placeholder="Type and size of suture used"
              />
            </div>

            <div>
              <Label htmlFor="hemorrhageControl">Hemorrhage Control</Label>
              <Textarea
                id="hemorrhageControl"
                value={hemorrhageControl}
                onChange={(e) => setHemorrhageControl(e.target.value)}
                placeholder="Methods used for hemostasis"
              />
            </div>

            <div>
              <Label htmlFor="complications">Complications</Label>
              <Textarea
                id="complications"
                value={complications}
                onChange={(e) => setComplications(e.target.value)}
                placeholder="Note any complications"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="postOpXrays"
                checked={postOpXrays}
                onCheckedChange={(checked) => setPostOpXrays(checked as boolean)}
              />
              <Label htmlFor="postOpXrays">Post-operative X-rays Taken</Label>
            </div>

            {postOpXrays && (
              <div>
                <Label htmlFor="postOpXrayFindings">Post-op X-ray Findings</Label>
                <Textarea
                  id="postOpXrayFindings"
                  value={postOpXrayFindings}
                  onChange={(e) => setPostOpXrayFindings(e.target.value)}
                  placeholder="Describe post-extraction radiographic findings"
                />
              </div>
            )}

            <div>
              <Label htmlFor="medications">Medications</Label>
              <Textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="List medications administered"
              />
            </div>

            <div>
              <Label htmlFor="painControl">Pain Control Protocol</Label>
              <Textarea
                id="painControl"
                value={painControl}
                onChange={(e) => setPainControl(e.target.value)}
                placeholder="Detail pain management plan"
              />
            </div>

            <div>
              <Label htmlFor="antibiotics">Antibiotics</Label>
              <Textarea
                id="antibiotics"
                value={antibiotics}
                onChange={(e) => setAntibiotics(e.target.value)}
                placeholder="Antibiotic selection and duration"
              />
            </div>

            <div>
              <Label htmlFor="homeInstructions">Home Care Instructions</Label>
              <Textarea
                id="homeInstructions"
                value={homeInstructions}
                onChange={(e) => setHomeInstructions(e.target.value)}
                placeholder="Detailed home care instructions"
              />
            </div>

            <div>
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietaryRestrictions"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Specify dietary restrictions and duration"
              />
            </div>

            <div>
              <Label htmlFor="followUpPlan">Follow-up Plan</Label>
              <Textarea
                id="followUpPlan"
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                placeholder="Specify follow-up schedule"
              />
            </div>

            <div>
              <Label htmlFor="healingProgress">Healing Progress</Label>
              <Textarea
                id="healingProgress"
                value={healingProgress}
                onChange={(e) => setHealingProgress(e.target.value)}
                placeholder="Document healing progress"
              />
            </div>

            <div>
              <Label htmlFor="dentalChartNotes">Dental Chart Notes</Label>
              <Textarea
                id="dentalChartNotes"
                value={dentalChartNotes}
                onChange={(e) => setDentalChartNotes(e.target.value)}
                placeholder="Additional dental chart notes"
              />
            </div>

            <div>
              <Label htmlFor="surgeonName">Surgeon/Dentist Name *</Label>
              <Input
                id="surgeonName"
                value={surgeonName}
                onChange={(e) => setSurgeonName(e.target.value)}
                placeholder="Enter surgeon's name"
                required
              />
            </div>

            <div>
              <Label htmlFor="assistantName">Assistant Name</Label>
              <Input
                id="assistantName"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Enter assistant's name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentObtained"
                checked={consentObtained}
                onCheckedChange={(checked) => setConsentObtained(checked as boolean)}
                required
              />
              <Label htmlFor="consentObtained" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Owner consent obtained for extractions *
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Documentation</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
} 