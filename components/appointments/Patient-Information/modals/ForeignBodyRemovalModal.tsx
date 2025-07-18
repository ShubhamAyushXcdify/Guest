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

interface ForeignBodyRemovalModalProps {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId: string
}

export default function ForeignBodyRemovalModal({
  open,
  onClose,
  patientId,
  appointmentId,
}: ForeignBodyRemovalModalProps) {
  // Form state
  const [objectType, setObjectType] = useState("")
  const [customObjectType, setCustomObjectType] = useState("")
  const [location, setLocation] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [detectionMethod, setDetectionMethod] = useState("")
  const [objectSize, setObjectSize] = useState("")
  const [objectMaterial, setObjectMaterial] = useState("")
  const [extractionMethod, setExtractionMethod] = useState("")
  const [anesthesiaType, setAnesthesiaType] = useState("")
  const [imagingUsed, setImagingUsed] = useState(false)
  const [imagingType, setImagingType] = useState("")
  const [imagingFindings, setImagingFindings] = useState("")
  const [complications, setComplications] = useState("")
  const [tissueTrauma, setTissueTrauma] = useState("")
  const [postOpCare, setPostOpCare] = useState("")
  const [medications, setMedications] = useState("")
  const [followUpPlan, setFollowUpPlan] = useState("")
  const [preventiveAdvice, setPreventiveAdvice] = useState("")
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

    if (!objectType || !location || !extractionMethod || !anesthesiaType || !surgeonName) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // TODO: Implement API call to save foreign body removal documentation
      toast.success("Foreign body removal documentation saved successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save foreign body removal documentation")
      console.error(error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Foreign Body Removal Documentation</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="objectType">Foreign Body Type *</Label>
              <Select value={objectType} onValueChange={setObjectType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select object type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food Item</SelectItem>
                  <SelectItem value="toy">Toy/Play Item</SelectItem>
                  <SelectItem value="fabric">Fabric/Textile</SelectItem>
                  <SelectItem value="plant">Plant Material</SelectItem>
                  <SelectItem value="metal">Metal Object</SelectItem>
                  <SelectItem value="plastic">Plastic Object</SelectItem>
                  <SelectItem value="bone">Bone</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {objectType === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Specify object type"
                  value={customObjectType}
                  onChange={(e) => setCustomObjectType(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esophagus">Esophagus</SelectItem>
                  <SelectItem value="stomach">Stomach</SelectItem>
                  <SelectItem value="intestine">Intestine</SelectItem>
                  <SelectItem value="skin">Skin/Subcutaneous</SelectItem>
                  <SelectItem value="paw">Paw/Foot</SelectItem>
                  <SelectItem value="ear">Ear Canal</SelectItem>
                  <SelectItem value="nose">Nasal Passage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {location === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Specify location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="detectionMethod">Detection Method</Label>
              <Input
                id="detectionMethod"
                value={detectionMethod}
                onChange={(e) => setDetectionMethod(e.target.value)}
                placeholder="How was the foreign body detected?"
              />
            </div>

            <div>
              <Label htmlFor="objectSize">Object Size/Dimensions</Label>
              <Input
                id="objectSize"
                value={objectSize}
                onChange={(e) => setObjectSize(e.target.value)}
                placeholder="Approximate size or dimensions"
              />
            </div>

            <div>
              <Label htmlFor="objectMaterial">Object Material/Composition</Label>
              <Input
                id="objectMaterial"
                value={objectMaterial}
                onChange={(e) => setObjectMaterial(e.target.value)}
                placeholder="Material composition if known"
              />
            </div>

            <div>
              <Label htmlFor="extractionMethod">Extraction Method *</Label>
              <Select value={extractionMethod} onValueChange={setExtractionMethod} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select extraction method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="endoscopic">Endoscopic Removal</SelectItem>
                  <SelectItem value="surgical">Surgical Extraction</SelectItem>
                  <SelectItem value="manual">Manual Extraction</SelectItem>
                  <SelectItem value="forceps">Forceps Removal</SelectItem>
                  <SelectItem value="flush">Flush/Irrigation</SelectItem>
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
                  <SelectItem value="sedation">Sedation</SelectItem>
                  <SelectItem value="none">None Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="imagingUsed"
                checked={imagingUsed}
                onCheckedChange={(checked) => setImagingUsed(checked as boolean)}
              />
              <Label htmlFor="imagingUsed">Imaging Used</Label>
            </div>

            {imagingUsed && (
              <>
                <div>
                  <Label htmlFor="imagingType">Imaging Type</Label>
                  <Select value={imagingType} onValueChange={setImagingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select imaging type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="ct">CT Scan</SelectItem>
                      <SelectItem value="endoscopy">Endoscopy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="imagingFindings">Imaging Findings</Label>
                  <Textarea
                    id="imagingFindings"
                    value={imagingFindings}
                    onChange={(e) => setImagingFindings(e.target.value)}
                    placeholder="Describe imaging findings"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="complications">Complications</Label>
              <Textarea
                id="complications"
                value={complications}
                onChange={(e) => setComplications(e.target.value)}
                placeholder="Note any complications during procedure"
              />
            </div>

            <div>
              <Label htmlFor="tissueTrauma">Tissue Trauma Assessment</Label>
              <Textarea
                id="tissueTrauma"
                value={tissueTrauma}
                onChange={(e) => setTissueTrauma(e.target.value)}
                placeholder="Describe any tissue damage or trauma"
              />
            </div>

            <div>
              <Label htmlFor="postOpCare">Post-Procedure Care</Label>
              <Textarea
                id="postOpCare"
                value={postOpCare}
                onChange={(e) => setPostOpCare(e.target.value)}
                placeholder="Post-procedure care instructions"
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
              <Label htmlFor="preventiveAdvice">Preventive Advice</Label>
              <Textarea
                id="preventiveAdvice"
                value={preventiveAdvice}
                onChange={(e) => setPreventiveAdvice(e.target.value)}
                placeholder="Advice to prevent future incidents"
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