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

interface BladderStoneRemovalModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

export default function BladderStoneRemovalModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: BladderStoneRemovalModalProps) {
  // Form state
  const [stoneLocation, setStoneLocation] = useState("")
  const [stoneSize, setStoneSize] = useState("")
  const [stoneNumber, setStoneNumber] = useState("")
  const [stoneComposition, setStoneComposition] = useState("")
  const [preOpImaging, setPreOpImaging] = useState("")
  const [imagingFindings, setImagingFindings] = useState("")
  const [urinalysisResults, setUrinalysisResults] = useState("")
  const [bloodworkResults, setBloodworkResults] = useState("")
  const [surgicalApproach, setSurgicalApproach] = useState("")
  const [anesthesiaType, setAnesthesiaType] = useState("")
  const [bladderWallCondition, setBladderWallCondition] = useState("")
  const [closureTechnique, setClosureTechnique] = useState("")
  const [bladderFlush, setBladderFlush] = useState(false)
  const [flushSolution, setFlushSolution] = useState("")
  const [complications, setComplications] = useState("")
  const [postOpCare, setPostOpCare] = useState("")
  const [medications, setMedications] = useState("")
  const [dietaryRecommendations, setDietaryRecommendations] = useState("")
  const [preventiveMeasures, setPreventiveMeasures] = useState("")
  const [followUpPlan, setFollowUpPlan] = useState("")
  const [labSubmission, setLabSubmission] = useState(false)
  const [labDetails, setLabDetails] = useState("")
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

    if (!stoneLocation || !surgicalApproach || !anesthesiaType || !surgeonName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // TODO: Implement API call to save bladder stone removal documentation
      toast.success("Bladder stone removal documentation saved successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save bladder stone removal documentation")
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bladder Stone Removal Documentation</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="stoneLocation">Stone Location *</Label>
              <Select value={stoneLocation} onValueChange={setStoneLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select stone location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bladder">Bladder</SelectItem>
                  <SelectItem value="urethra">Urethra</SelectItem>
                  <SelectItem value="both">Both Bladder and Urethra</SelectItem>
                  <SelectItem value="other">Other Urinary Tract Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stoneSize">Stone Size</Label>
              <Input
                id="stoneSize"
                value={stoneSize}
                onChange={(e) => setStoneSize(e.target.value)}
                placeholder="Size in millimeters"
              />
            </div>

            <div>
              <Label htmlFor="stoneNumber">Number of Stones</Label>
              <Input
                id="stoneNumber"
                value={stoneNumber}
                onChange={(e) => setStoneNumber(e.target.value)}
                placeholder="Number of stones removed"
              />
            </div>

            <div>
              <Label htmlFor="stoneComposition">Stone Composition (if known)</Label>
              <Input
                id="stoneComposition"
                value={stoneComposition}
                onChange={(e) => setStoneComposition(e.target.value)}
                placeholder="Type of stone if identified"
              />
            </div>

            <div>
              <Label htmlFor="preOpImaging">Pre-operative Imaging *</Label>
              <Select value={preOpImaging} onValueChange={setPreOpImaging} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select imaging type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xray">X-Ray</SelectItem>
                  <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  <SelectItem value="ct">CT Scan</SelectItem>
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
                placeholder="Describe imaging results"
              />
            </div>

            <div>
              <Label htmlFor="urinalysisResults">Urinalysis Results</Label>
              <Textarea
                id="urinalysisResults"
                value={urinalysisResults}
                onChange={(e) => setUrinalysisResults(e.target.value)}
                placeholder="Summary of urinalysis findings"
              />
            </div>

            <div>
              <Label htmlFor="bloodworkResults">Bloodwork Results</Label>
              <Textarea
                id="bloodworkResults"
                value={bloodworkResults}
                onChange={(e) => setBloodworkResults(e.target.value)}
                placeholder="Relevant blood test results"
              />
            </div>

            <div>
              <Label htmlFor="surgicalApproach">Surgical Approach *</Label>
              <Select value={surgicalApproach} onValueChange={setSurgicalApproach} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select surgical approach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventral">Ventral Cystotomy</SelectItem>
                  <SelectItem value="laparoscopic">Laparoscopic Approach</SelectItem>
                  <SelectItem value="minimally">Minimally Invasive</SelectItem>
                  <SelectItem value="other">Other Approach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="anesthesiaType">Anesthesia Type *</Label>
              <Select value={anesthesiaType} onValueChange={setAnesthesiaType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select anesthesia type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Anesthesia</SelectItem>
                  <SelectItem value="local">Local Anesthesia</SelectItem>
                  <SelectItem value="regional">Regional Block</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bladderWallCondition">Bladder Wall Condition</Label>
              <Textarea
                id="bladderWallCondition"
                value={bladderWallCondition}
                onChange={(e) => setBladderWallCondition(e.target.value)}
                placeholder="Describe bladder wall condition and any abnormalities"
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
                id="bladderFlush"
                checked={bladderFlush}
                onCheckedChange={(checked) => setBladderFlush(checked as boolean)}
              />
              <Label htmlFor="bladderFlush">Bladder Flush Performed</Label>
            </div>

            {bladderFlush && (
              <div>
                <Label htmlFor="flushSolution">Flush Solution Details</Label>
                <Input
                  id="flushSolution"
                  value={flushSolution}
                  onChange={(e) => setFlushSolution(e.target.value)}
                  placeholder="Type and volume of flush solution"
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
              <Label htmlFor="dietaryRecommendations">Dietary Recommendations</Label>
              <Textarea
                id="dietaryRecommendations"
                value={dietaryRecommendations}
                onChange={(e) => setDietaryRecommendations(e.target.value)}
                placeholder="Dietary recommendations to prevent recurrence"
              />
            </div>

            <div>
              <Label htmlFor="preventiveMeasures">Preventive Measures</Label>
              <Textarea
                id="preventiveMeasures"
                value={preventiveMeasures}
                onChange={(e) => setPreventiveMeasures(e.target.value)}
                placeholder="Recommended measures to prevent stone formation"
              />
            </div>

            <div>
              <Label htmlFor="followUpPlan">Follow-up Plan</Label>
              <Textarea
                id="followUpPlan"
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                placeholder="Specify follow-up schedule and requirements"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="labSubmission"
                checked={labSubmission}
                onCheckedChange={(checked) => setLabSubmission(checked as boolean)}
              />
              <Label htmlFor="labSubmission">Stone Submitted for Analysis</Label>
            </div>

            {labSubmission && (
              <div>
                <Label htmlFor="labDetails">Laboratory Submission Details</Label>
                <Input
                  id="labDetails"
                  value={labDetails}
                  onChange={(e) => setLabDetails(e.target.value)}
                  placeholder="Lab details and submission information"
                />
              </div>
            )}

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