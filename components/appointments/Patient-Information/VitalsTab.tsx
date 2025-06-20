"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useGetVitalDetailByVisitId } from "@/queries/vitals/get-vital-detail-by-visit-id"
import { useCreateVitalDetail } from "@/queries/vitals/create-vital-detail"
import { useUpdateVitalDetail } from "@/queries/vitals/update-vital-detail"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTabCompletion } from "@/context/TabCompletionContext"

interface VitalsTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function VitalsTab({ patientId, appointmentId, onNext }: VitalsTabProps) {
  const { markTabAsCompleted } = useTabCompletion()
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get vital details by visitId if we have a visit
  const { data: vitalDetail, refetch: refetchVitalDetail } = useGetVitalDetailByVisitId(
    visitData?.id || ""
  )

  // State for form fields
  const [temperatureC, setTemperatureC] = useState<number | undefined>(undefined)
  const [heartRateBpm, setHeartRateBpm] = useState<number | undefined>(undefined)
  const [respiratoryRateBpm, setRespiratoryRateBpm] = useState<number | undefined>(undefined)
  const [mucousMembraneColor, setMucousMembraneColor] = useState<string>("")
  const [capillaryRefillTimeSec, setCapillaryRefillTimeSec] = useState<number | undefined>(undefined)
  const [hydrationStatus, setHydrationStatus] = useState<string>("")
  const [notes, setNotes] = useState("")

  // Use mutateAsync pattern for better control flow
  const { mutateAsync: createVitalDetail, isPending: isCreating } = useCreateVitalDetail()
  const { mutateAsync: updateVitalDetail, isPending: isUpdating } = useUpdateVitalDetail()
  
  // Combined loading state
  const isPending = isCreating || isUpdating

  // Initialize form with existing data when available
  useEffect(() => {
    if (vitalDetail) {
      setTemperatureC(vitalDetail.temperatureC)
      setHeartRateBpm(vitalDetail.heartRateBpm)
      setRespiratoryRateBpm(vitalDetail.respiratoryRateBpm)
      setMucousMembraneColor(vitalDetail.mucousMembraneColor || "")
      setCapillaryRefillTimeSec(vitalDetail.capillaryRefillTimeSec)
      setHydrationStatus(vitalDetail.hydrationStatus || "")
      setNotes(vitalDetail.notes || "")
      
      // Mark tab as completed if it was already completed or if basic vitals are present
      if (vitalDetail.isCompleted || 
          vitalDetail.temperatureC || 
          vitalDetail.heartRateBpm || 
          vitalDetail.respiratoryRateBpm) {
        markTabAsCompleted("vitals")
      }
    }
  }, [vitalDetail, markTabAsCompleted])
  
  // Always mark the tab as completed if we have vital measurements
  useEffect(() => {
    if (temperatureC || heartRateBpm || respiratoryRateBpm) {
      markTabAsCompleted("vitals")
    }
  }, [temperatureC, heartRateBpm, respiratoryRateBpm, markTabAsCompleted])

  const handleSave = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    
    try {
      const vitalData = {
        temperatureC,
        heartRateBpm,
        respiratoryRateBpm,
        mucousMembraneColor: mucousMembraneColor || undefined,
        capillaryRefillTimeSec,
        hydrationStatus: hydrationStatus || undefined,
        notes: notes || undefined,
        isCompleted: true
      }
      
      if (vitalDetail) {
        // Update with ID in the payload as required by API
        await updateVitalDetail({
          id: vitalDetail.id,
          ...vitalData
        })
        
        toast.success("Vital details updated successfully")
      } else {
        // Create new vital detail
        await createVitalDetail({
          visitId: visitData.id,
          ...vitalData
        })
        
        toast.success("Vital details saved successfully")
      }
      
      // Mark the tab as completed
      markTabAsCompleted("vitals")
      
      // After successful save, refetch data and navigate to next tab
      refetchVitalDetail()
      if (onNext) {
        onNext()
      }
    } catch (error) {
      console.error('Error saving vital details:', error)
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (visitLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading visit data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!visitData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">No visit found for this appointment. Please make sure a visit has been created.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Patient Vitals</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temperatureC">Temperature (°C)</Label>
              <Input
                id="temperatureC"
                type="number"
                step="0.1"
                placeholder="38.5"
                value={temperatureC || ""}
                onChange={(e) => setTemperatureC(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartRateBpm">Heart Rate (BPM)</Label>
              <Input
                id="heartRateBpm"
                type="number"
                placeholder="80"
                value={heartRateBpm || ""}
                onChange={(e) => setHeartRateBpm(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratoryRateBpm">Respiratory Rate (BPM)</Label>
              <Input
                id="respiratoryRateBpm"
                type="number"
                placeholder="20"
                value={respiratoryRateBpm || ""}
                onChange={(e) => setRespiratoryRateBpm(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mucousMembraneColor">Mucous Membrane Color</Label>
              <Select 
                value={mucousMembraneColor} 
                onValueChange={setMucousMembraneColor}
              >
                <SelectTrigger id="mucousMembraneColor">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pink">Pink</SelectItem>
                  <SelectItem value="pale">Pale</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue/Cyanotic</SelectItem>
                  <SelectItem value="yellow">Yellow/Jaundiced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capillaryRefillTimeSec">Capillary Refill Time (seconds)</Label>
              <Input
                id="capillaryRefillTimeSec"
                type="number"
                step="0.5"
                placeholder="1.5"
                value={capillaryRefillTimeSec || ""}
                onChange={(e) => setCapillaryRefillTimeSec(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hydrationStatus">Hydration Status</Label>
              <Select 
                value={hydrationStatus} 
                onValueChange={setHydrationStatus}
              >
                <SelectTrigger id="hydrationStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="mild">Mild Dehydration</SelectItem>
                  <SelectItem value="moderate">Moderate Dehydration</SelectItem>
                  <SelectItem value="severe">Severe Dehydration</SelectItem>
                  <SelectItem value="overhydrated">Overhydrated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter any additional observations or notes about the patient's vital signs..."
            className="mt-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isPending}
            className="ml-2"
          >
            {isPending 
              ? "Saving..." 
              : vitalDetail ? "Update" : "Save & Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 