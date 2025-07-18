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

interface OrthopedicSurgeryModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

export default function OrthopedicSurgeryModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: OrthopedicSurgeryModalProps) {
  // Form state
  const [surgeryType, setSurgeryType] = useState("")
  const [customSurgeryType, setCustomSurgeryType] = useState("")
  const [location, setLocation] = useState("")
  const [side, setSide] = useState("")
  const [preOpDiagnosis, setPreOpDiagnosis] = useState("")
  const [preOpImaging, setPreOpImaging] = useState("")
  const [imagingFindings, setImagingFindings] = useState("")
  const [weightBearing, setWeightBearing] = useState("")
  const [implantType, setImplantType] = useState("")
  const [implantDetails, setImplantDetails] = useState("")
  const [anesthesiaType, setAnesthesiaType] = useState("")
  const [surgicalApproach, setSurgicalApproach] = useState("")
  const [closureTechnique, setClosureTechnique] = useState("")
  const [boneFusion, setBoneFusion] = useState(false)
  const [fusionMethod, setFusionMethod] = useState("")
  const [complications, setComplications] = useState("")
  const [postOpCare, setPostOpCare] = useState("")
  const [medications, setMedications] = useState("")
  const [rehabilitationPlan, setRehabilitationPlan] = useState("")
  const [activityRestrictions, setActivityRestrictions] = useState("")
  const [followUpSchedule, setFollowUpSchedule] = useState("")
  const [expectedRecovery, setExpectedRecovery] = useState("")
  const [painManagement, setPainManagement] = useState("")
  const [bandageInstructions, setBandageInstructions] = useState("")
  const [exerciseProtocol, setExerciseProtocol] = useState("")
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

    if (!surgeryType || !location || !side || !anesthesiaType || !surgeonName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // TODO: Implement API call to save orthopedic surgery documentation
      toast.success("Orthopedic surgery documentation saved successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save orthopedic surgery documentation")
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Orthopedic Surgery Documentation</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="surgeryType">Surgery Type *</Label>
              <Select value={surgeryType} onValueChange={setSurgeryType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select surgery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fracture">Fracture Repair</SelectItem>
                  <SelectItem value="acl">ACL/CCL Repair</SelectItem>
                  <SelectItem value="tplo">TPLO</SelectItem>
                  <SelectItem value="tto">TTO</SelectItem>
                  <SelectItem value="hipDysplasia">Hip Dysplasia Surgery</SelectItem>
                  <SelectItem value="fho">Femoral Head Ostectomy</SelectItem>
                  <SelectItem value="arthroscopy">Arthroscopy</SelectItem>
                  <SelectItem value="jointFusion">Joint Fusion</SelectItem>
                  <SelectItem value="pinning">Fracture Pinning</SelectItem>
                  <SelectItem value="plating">Plating</SelectItem>
                  <SelectItem value="externalFixation">External Fixation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {surgeryType === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Specify surgery type"
                  value={customSurgeryType}
                  onChange={(e) => setCustomSurgeryType(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="location">Anatomical Location *</Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stifle">Stifle (Knee)</SelectItem>
                  <SelectItem value="hip">Hip</SelectItem>
                  <SelectItem value="shoulder">Shoulder</SelectItem>
                  <SelectItem value="elbow">Elbow</SelectItem>
                  <SelectItem value="carpus">Carpus (Wrist)</SelectItem>
                  <SelectItem value="tarsus">Tarsus (Ankle)</SelectItem>
                  <SelectItem value="spine">Spine</SelectItem>
                  <SelectItem value="femur">Femur</SelectItem>
                  <SelectItem value="tibia">Tibia</SelectItem>
                  <SelectItem value="radius">Radius/Ulna</SelectItem>
                  <SelectItem value="humerus">Humerus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="side">Side *</Label>
              <Select value={side} onValueChange={setSide} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="bilateral">Bilateral</SelectItem>
                  <SelectItem value="midline">Midline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preOpDiagnosis">Pre-operative Diagnosis</Label>
              <Textarea
                id="preOpDiagnosis"
                value={preOpDiagnosis}
                onChange={(e) => setPreOpDiagnosis(e.target.value)}
                placeholder="Describe pre-operative diagnosis and findings"
              />
            </div>

            <div>
              <Label htmlFor="preOpImaging">Pre-operative Imaging *</Label>
              <Select value={preOpImaging} onValueChange={setPreOpImaging} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select imaging type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radiographs">Radiographs</SelectItem>
                  <SelectItem value="ct">CT Scan</SelectItem>
                  <SelectItem value="mri">MRI</SelectItem>
                  <SelectItem value="multiple">Multiple Methods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imagingFindings">Imaging Findings</Label>
              <Textarea
                id="imagingFindings"
                value={imagingFindings}
                onChange={(e) => setImagingFindings(e.target.value)}
                placeholder="Describe imaging results and measurements"
              />
            </div>

            <div>
              <Label htmlFor="weightBearing">Weight Bearing Status</Label>
              <Select value={weightBearing} onValueChange={setWeightBearing}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weight bearing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non-Weight Bearing</SelectItem>
                  <SelectItem value="partial">Partial Weight Bearing</SelectItem>
                  <SelectItem value="progressive">Progressive Weight Bearing</SelectItem>
                  <SelectItem value="full">Full Weight Bearing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="implantType">Implant Type</Label>
              <Select value={implantType} onValueChange={setImplantType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select implant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plate">Bone Plate</SelectItem>
                  <SelectItem value="screws">Screws</SelectItem>
                  <SelectItem value="pins">Pins</SelectItem>
                  <SelectItem value="wire">Cerclage Wire</SelectItem>
                  <SelectItem value="externalFixator">External Fixator</SelectItem>
                  <SelectItem value="prosthetic">Prosthetic Joint</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {implantType !== "none" && (
              <div>
                <Label htmlFor="implantDetails">Implant Details</Label>
                <Textarea
                  id="implantDetails"
                  value={implantDetails}
                  onChange={(e) => setImplantDetails(e.target.value)}
                  placeholder="Specify implant size, manufacturer, and other details"
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
                  <SelectItem value="regional">Regional Block</SelectItem>
                  <SelectItem value="combined">Combined Technique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="surgicalApproach">Surgical Approach</Label>
              <Textarea
                id="surgicalApproach"
                value={surgicalApproach}
                onChange={(e) => setSurgicalApproach(e.target.value)}
                placeholder="Describe surgical approach and technique"
              />
            </div>

            <div>
              <Label htmlFor="closureTechnique">Closure Technique</Label>
              <Textarea
                id="closureTechnique"
                value={closureTechnique}
                onChange={(e) => setClosureTechnique(e.target.value)}
                placeholder="Describe closure method and materials used"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="boneFusion"
                checked={boneFusion}
                onCheckedChange={(checked) => setBoneFusion(checked as boolean)}
              />
              <Label htmlFor="boneFusion">Bone Fusion Performed</Label>
            </div>

            {boneFusion && (
              <div>
                <Label htmlFor="fusionMethod">Fusion Method</Label>
                <Textarea
                  id="fusionMethod"
                  value={fusionMethod}
                  onChange={(e) => setFusionMethod(e.target.value)}
                  placeholder="Describe fusion technique and materials"
                />
              </div>
            )}

            <div>
              <Label htmlFor="complications">Complications</Label>
              <Textarea
                id="complications"
                value={complications}
                onChange={(e) => setComplications(e.target.value)}
                placeholder="Note any complications during surgery"
              />
            </div>

            <div>
              <Label htmlFor="postOpCare">Post-operative Care</Label>
              <Textarea
                id="postOpCare"
                value={postOpCare}
                onChange={(e) => setPostOpCare(e.target.value)}
                placeholder="Post-operative care instructions"
              />
            </div>

            <div>
              <Label htmlFor="medications">Medications</Label>
              <Textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="List prescribed medications and dosages"
              />
            </div>

            <div>
              <Label htmlFor="rehabilitationPlan">Rehabilitation Plan</Label>
              <Textarea
                id="rehabilitationPlan"
                value={rehabilitationPlan}
                onChange={(e) => setRehabilitationPlan(e.target.value)}
                placeholder="Detailed rehabilitation protocol"
              />
            </div>

            <div>
              <Label htmlFor="activityRestrictions">Activity Restrictions</Label>
              <Textarea
                id="activityRestrictions"
                value={activityRestrictions}
                onChange={(e) => setActivityRestrictions(e.target.value)}
                placeholder="Specify activity restrictions and duration"
              />
            </div>

            <div>
              <Label htmlFor="followUpSchedule">Follow-up Schedule</Label>
              <Textarea
                id="followUpSchedule"
                value={followUpSchedule}
                onChange={(e) => setFollowUpSchedule(e.target.value)}
                placeholder="Specify follow-up appointments and milestones"
              />
            </div>

            <div>
              <Label htmlFor="expectedRecovery">Expected Recovery Timeline</Label>
              <Textarea
                id="expectedRecovery"
                value={expectedRecovery}
                onChange={(e) => setExpectedRecovery(e.target.value)}
                placeholder="Outline expected recovery milestones"
              />
            </div>

            <div>
              <Label htmlFor="painManagement">Pain Management Protocol</Label>
              <Textarea
                id="painManagement"
                value={painManagement}
                onChange={(e) => setPainManagement(e.target.value)}
                placeholder="Detail pain management strategy"
              />
            </div>

            <div>
              <Label htmlFor="bandageInstructions">Bandage Care Instructions</Label>
              <Textarea
                id="bandageInstructions"
                value={bandageInstructions}
                onChange={(e) => setBandageInstructions(e.target.value)}
                placeholder="Bandage change schedule and care instructions"
              />
            </div>

            <div>
              <Label htmlFor="exerciseProtocol">Exercise Protocol</Label>
              <Textarea
                id="exerciseProtocol"
                value={exerciseProtocol}
                onChange={(e) => setExerciseProtocol(e.target.value)}
                placeholder="Detailed exercise and physical therapy instructions"
              />
            </div>

            <div>
              <Label htmlFor="surgeonName">Surgeon Name *</Label>
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
                Owner consent obtained for surgery *
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