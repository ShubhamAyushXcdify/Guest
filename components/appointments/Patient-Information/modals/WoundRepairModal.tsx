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

interface WoundRepairModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

export default function WoundRepairModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: WoundRepairModalProps) {
  // Form state
  const [woundType, setWoundType] = useState("")
  const [customWoundType, setCustomWoundType] = useState("")
  const [woundLocation, setWoundLocation] = useState("")
  const [woundSize, setWoundSize] = useState("")
  const [woundDepth, setWoundDepth] = useState("")
  const [woundAge, setWoundAge] = useState("")
  const [causeOfInjury, setCauseOfInjury] = useState("")
  const [contaminationLevel, setContaminationLevel] = useState("")
  const [tissueViability, setTissueViability] = useState("")
  const [cleaningMethod, setCleaningMethod] = useState("")
  const [cleaningSolution, setCleaningSolution] = useState("")
  const [debrided, setDebrided] = useState(false)
  const [debridementMethod, setDebridementMethod] = useState("")
  const [anesthesiaType, setAnesthesiaType] = useState("")
  const [sutureType, setSutureType] = useState("")
  const [sutureMaterial, setSutureMaterial] = useState("")
  const [layersClosed, setLayersClosed] = useState("")
  const [drainPlaced, setDrainPlaced] = useState(false)
  const [drainType, setDrainType] = useState("")
  const [bandageType, setBandageType] = useState("")
  const [medications, setMedications] = useState("")
  const [antibiotics, setAntibiotics] = useState("")
  const [painControl, setPainControl] = useState("")
  const [complications, setComplications] = useState("")
  const [homeInstructions, setHomeInstructions] = useState("")
  const [activityRestrictions, setActivityRestrictions] = useState("")
  const [bandageChangeSchedule, setBandageChangeSchedule] = useState("")
  const [followUpPlan, setFollowUpPlan] = useState("")
  const [sutureRemovalDate, setSutureRemovalDate] = useState("")
  const [healingProgress, setHealingProgress] = useState("")
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

    if (!woundType || !woundLocation || !anesthesiaType || !surgeonName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // TODO: Implement API call to save wound repair documentation
      toast.success("Wound repair documentation saved successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save wound repair documentation")
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Wound Repair Documentation</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="woundType">Wound Type *</Label>
              <Select value={woundType} onValueChange={setWoundType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select wound type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laceration">Laceration</SelectItem>
                  <SelectItem value="puncture">Puncture Wound</SelectItem>
                  <SelectItem value="abrasion">Abrasion</SelectItem>
                  <SelectItem value="avulsion">Avulsion</SelectItem>
                  <SelectItem value="bite">Bite Wound</SelectItem>
                  <SelectItem value="surgical">Surgical Wound</SelectItem>
                  <SelectItem value="burn">Burn</SelectItem>
                  <SelectItem value="degloving">Degloving Injury</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {woundType === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Specify wound type"
                  value={customWoundType}
                  onChange={(e) => setCustomWoundType(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="woundLocation">Wound Location *</Label>
              <Input
                id="woundLocation"
                value={woundLocation}
                onChange={(e) => setWoundLocation(e.target.value)}
                placeholder="Anatomical location of wound"
                required
              />
            </div>

            <div>
              <Label htmlFor="woundSize">Wound Size</Label>
              <Input
                id="woundSize"
                value={woundSize}
                onChange={(e) => setWoundSize(e.target.value)}
                placeholder="Length x width x depth in cm"
              />
            </div>

            <div>
              <Label htmlFor="woundDepth">Wound Depth</Label>
              <Select value={woundDepth} onValueChange={setWoundDepth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wound depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superficial">Superficial</SelectItem>
                  <SelectItem value="partial">Partial Thickness</SelectItem>
                  <SelectItem value="full">Full Thickness</SelectItem>
                  <SelectItem value="deep">Deep Tissue Involvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="woundAge">Wound Age/Duration</Label>
              <Input
                id="woundAge"
                value={woundAge}
                onChange={(e) => setWoundAge(e.target.value)}
                placeholder="Time since injury occurred"
              />
            </div>

            <div>
              <Label htmlFor="causeOfInjury">Cause of Injury</Label>
              <Textarea
                id="causeOfInjury"
                value={causeOfInjury}
                onChange={(e) => setCauseOfInjury(e.target.value)}
                placeholder="Describe how the injury occurred"
              />
            </div>

            <div>
              <Label htmlFor="contaminationLevel">Contamination Level</Label>
              <Select value={contaminationLevel} onValueChange={setContaminationLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contamination level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="clean-contaminated">Clean-Contaminated</SelectItem>
                  <SelectItem value="contaminated">Contaminated</SelectItem>
                  <SelectItem value="dirty">Dirty/Infected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tissueViability">Tissue Viability</Label>
              <Textarea
                id="tissueViability"
                value={tissueViability}
                onChange={(e) => setTissueViability(e.target.value)}
                placeholder="Describe tissue condition and viability"
              />
            </div>

            <div>
              <Label htmlFor="cleaningMethod">Cleaning Method</Label>
              <Select value={cleaningMethod} onValueChange={setCleaningMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cleaning method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="irrigation">Irrigation</SelectItem>
                  <SelectItem value="scrubbing">Surgical Scrub</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cleaningSolution">Cleaning Solution</Label>
              <Input
                id="cleaningSolution"
                value={cleaningSolution}
                onChange={(e) => setCleaningSolution(e.target.value)}
                placeholder="Solution used for cleaning"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="debrided"
                checked={debrided}
                onCheckedChange={(checked) => setDebrided(checked as boolean)}
              />
              <Label htmlFor="debrided">Debridement Performed</Label>
            </div>

            {debrided && (
              <div>
                <Label htmlFor="debridementMethod">Debridement Method</Label>
                <Select value={debridementMethod} onValueChange={setDebridementMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select debridement method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sharp">Sharp/Surgical</SelectItem>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="enzymatic">Enzymatic</SelectItem>
                    <SelectItem value="autolytic">Autolytic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="anesthesiaType">Anesthesia Type *</Label>
              <Select value={anesthesiaType} onValueChange={setAnesthesiaType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthesia type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="regional">Regional Block</SelectItem>
                  <SelectItem value="sedation">Sedation</SelectItem>
                  <SelectItem value="general">General Anesthesia</SelectItem>
                  <SelectItem value="none">None Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sutureType">Suture Pattern</Label>
              <Input
                id="sutureType"
                value={sutureType}
                onChange={(e) => setSutureType(e.target.value)}
                placeholder="Type of suture pattern used"
              />
            </div>

            <div>
              <Label htmlFor="sutureMaterial">Suture Material</Label>
              <Input
                id="sutureMaterial"
                value={sutureMaterial}
                onChange={(e) => setSutureMaterial(e.target.value)}
                placeholder="Type and size of suture material"
              />
            </div>

            <div>
              <Label htmlFor="layersClosed">Layers Closed</Label>
              <Textarea
                id="layersClosed"
                value={layersClosed}
                onChange={(e) => setLayersClosed(e.target.value)}
                placeholder="Description of tissue layers closed"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="drainPlaced"
                checked={drainPlaced}
                onCheckedChange={(checked) => setDrainPlaced(checked as boolean)}
              />
              <Label htmlFor="drainPlaced">Drain Placed</Label>
            </div>

            {drainPlaced && (
              <div>
                <Label htmlFor="drainType">Drain Type</Label>
                <Input
                  id="drainType"
                  value={drainType}
                  onChange={(e) => setDrainType(e.target.value)}
                  placeholder="Type of drain used"
                />
              </div>
            )}

            <div>
              <Label htmlFor="bandageType">Bandage Type</Label>
              <Input
                id="bandageType"
                value={bandageType}
                onChange={(e) => setBandageType(e.target.value)}
                placeholder="Type of bandage applied"
              />
            </div>

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
              <Label htmlFor="antibiotics">Antibiotics</Label>
              <Textarea
                id="antibiotics"
                value={antibiotics}
                onChange={(e) => setAntibiotics(e.target.value)}
                placeholder="Antibiotic selection and duration"
              />
            </div>

            <div>
              <Label htmlFor="painControl">Pain Control</Label>
              <Textarea
                id="painControl"
                value={painControl}
                onChange={(e) => setPainControl(e.target.value)}
                placeholder="Pain management protocol"
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
              <Label htmlFor="activityRestrictions">Activity Restrictions</Label>
              <Textarea
                id="activityRestrictions"
                value={activityRestrictions}
                onChange={(e) => setActivityRestrictions(e.target.value)}
                placeholder="Specify activity restrictions"
              />
            </div>

            <div>
              <Label htmlFor="bandageChangeSchedule">Bandage Change Schedule</Label>
              <Textarea
                id="bandageChangeSchedule"
                value={bandageChangeSchedule}
                onChange={(e) => setBandageChangeSchedule(e.target.value)}
                placeholder="Schedule for bandage changes"
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
              <Label htmlFor="sutureRemovalDate">Suture Removal Date</Label>
              <Input
                id="sutureRemovalDate"
                value={sutureRemovalDate}
                onChange={(e) => setSutureRemovalDate(e.target.value)}
                placeholder="Planned date for suture removal"
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
              <Label htmlFor="surgeonName">Surgeon/Clinician Name *</Label>
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
                Owner consent obtained for procedure *
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