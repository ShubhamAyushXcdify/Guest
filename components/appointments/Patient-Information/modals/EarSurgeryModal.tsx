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

interface EarSurgeryModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

export default function EarSurgeryModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: EarSurgeryModalProps) {
  // Form state
  const [surgeryType, setSurgeryType] = useState("")
  const [surgeryLocation, setSurgeryLocation] = useState("")
  const [anesthesiaType, setAnesthesiaType] = useState("")
  const [preOpDiagnosis, setPreOpDiagnosis] = useState("")
  const [surgicalApproach, setSurgicalApproach] = useState("")
  const [bleedingControl, setBleedingControl] = useState("")
  const [closureTechnique, setClosureTechnique] = useState("")
  const [drainagePlaced, setDrainagePlaced] = useState(false)
  const [drainageDetails, setDrainageDetails] = useState("")
  const [complications, setComplications] = useState("")
  const [postOpInstructions, setPostOpInstructions] = useState("")
  const [medications, setMedications] = useState("")
  const [followUpPlan, setFollowUpPlan] = useState("")
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

    if (!surgeryType || !surgeryLocation || !anesthesiaType || !surgeonName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // TODO: Implement API call to save ear surgery documentation
      toast.success("Ear surgery documentation saved successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save ear surgery documentation")
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Ear Surgery Documentation</SheetTitle>
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
                  <SelectItem value="hematoma">Ear Hematoma Drainage</SelectItem>
                  <SelectItem value="resection">Ear Canal Resection</SelectItem>
                  <SelectItem value="ablation">Total Ear Canal Ablation</SelectItem>
                  <SelectItem value="polyp">Ear Polyp Removal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="surgeryLocation">Surgery Location *</Label>
              <Select value={surgeryLocation} onValueChange={setSurgeryLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select ear location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Ear</SelectItem>
                  <SelectItem value="right">Right Ear</SelectItem>
                  <SelectItem value="bilateral">Bilateral</SelectItem>
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
                  <SelectItem value="sedation">Sedation with Local</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preOpDiagnosis">Pre-operative Diagnosis</Label>
              <Textarea
                id="preOpDiagnosis"
                value={preOpDiagnosis}
                onChange={(e) => setPreOpDiagnosis(e.target.value)}
                placeholder="Enter pre-operative diagnosis"
              />
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
              <Label htmlFor="bleedingControl">Bleeding Control</Label>
              <Input
                id="bleedingControl"
                value={bleedingControl}
                onChange={(e) => setBleedingControl(e.target.value)}
                placeholder="Methods used for hemostasis"
              />
            </div>

            <div>
              <Label htmlFor="closureTechnique">Closure Technique</Label>
              <Input
                id="closureTechnique"
                value={closureTechnique}
                onChange={(e) => setClosureTechnique(e.target.value)}
                placeholder="Describe closure method"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="drainagePlaced"
                checked={drainagePlaced}
                onCheckedChange={(checked) => setDrainagePlaced(checked as boolean)}
              />
              <Label htmlFor="drainagePlaced">Drainage Placed</Label>
            </div>

            {drainagePlaced && (
              <div>
                <Label htmlFor="drainageDetails">Drainage Details</Label>
                <Input
                  id="drainageDetails"
                  value={drainageDetails}
                  onChange={(e) => setDrainageDetails(e.target.value)}
                  placeholder="Specify drainage type and location"
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
              <Label htmlFor="postOpInstructions">Post-operative Instructions</Label>
              <Textarea
                id="postOpInstructions"
                value={postOpInstructions}
                onChange={(e) => setPostOpInstructions(e.target.value)}
                placeholder="Detailed post-operative care instructions"
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
              <Label htmlFor="followUpPlan">Follow-up Plan</Label>
              <Textarea
                id="followUpPlan"
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                placeholder="Specify follow-up schedule and requirements"
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