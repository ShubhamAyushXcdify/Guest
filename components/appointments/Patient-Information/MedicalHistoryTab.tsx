"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { 
  useGetMedicalHistoryDetailByVisitId, 
  useCreateMedicalHistoryDetail, 
  useUpdateMedicalHistoryDetail,
  MedicalHistoryDetail
} from "@/queries/MedicalHistoryDetail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"

interface MedicalHistoryTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function MedicalHistoryTab({ patientId, appointmentId, onNext }: MedicalHistoryTabProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<MedicalHistoryDetail>>({
    chronicConditionsNotes: '',
    surgeriesNotes: '',
    currentMedicationsNotes: '',
    generalNotes: '',
    isCompleted: false,
  })
  const [medicalHistoryId, setMedicalHistoryId] = useState<string | null>(null)

  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get medical history data by visitId if we have a visit
  const { data: medicalHistoryDetail, isLoading: historyLoading } = useGetMedicalHistoryDetailByVisitId(
    visitData?.id || ""
  )
  
  const { mutateAsync: createMedicalHistory, isPending: isCreating } = useCreateMedicalHistoryDetail()
  const { mutateAsync: updateMedicalHistory, isPending: isUpdating } = useUpdateMedicalHistoryDetail()

  const isPending = isCreating || isUpdating || visitLoading

  useEffect(() => {
    if (medicalHistoryDetail) {
      setFormData({
        chronicConditionsNotes: medicalHistoryDetail.chronicConditionsNotes || '',
        surgeriesNotes: medicalHistoryDetail.surgeriesNotes || '',
        currentMedicationsNotes: medicalHistoryDetail.currentMedicationsNotes || '',
        generalNotes: medicalHistoryDetail.generalNotes || '',
        isCompleted: medicalHistoryDetail.isCompleted || false,
      })
      setMedicalHistoryId(medicalHistoryDetail.id)
    }
  }, [medicalHistoryDetail])

  const handleInputChange = (field: keyof MedicalHistoryDetail, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (!visitData?.id) {
        toast({
          title: "Error",
          description: "No visit data found for this appointment",
          variant: "destructive",
        })
        return
      }
      
      if (medicalHistoryId) {
        await updateMedicalHistory({
          id: medicalHistoryId,
          ...formData,
          visitId: visitData.id,
        })
        toast({
          title: "Medical history updated",
          description: "Medical history has been updated successfully.",
        })
      } else {
        const result = await createMedicalHistory({
          ...formData,
          visitId: visitData.id,
        })
        setMedicalHistoryId(result.id)
        toast({
          title: "Medical history created",
          description: "Medical history has been created successfully.",
        })
      }
      
      if (onNext) {
        onNext()
      }
    } catch (error) {
      console.error('Error saving medical history:', error)
      toast({
        title: "Error",
        description: "Failed to save medical history information.",
        variant: "destructive",
      })
    }
  }

  if (visitLoading || historyLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading medical history...</span>
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
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Medical History</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chronicConditions">Chronic Conditions</Label>
            <Textarea
              id="chronicConditions"
              placeholder="Enter any chronic conditions..."
              value={formData.chronicConditionsNotes}
              onChange={(e) => handleInputChange('chronicConditionsNotes', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="surgeries">Surgeries</Label>
            <Textarea
              id="surgeries"
              placeholder="Enter any surgeries..."
              value={formData.surgeriesNotes}
              onChange={(e) => handleInputChange('surgeriesNotes', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              placeholder="Enter current medications..."
              value={formData.currentMedicationsNotes}
              onChange={(e) => handleInputChange('currentMedicationsNotes', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="generalNotes">General Notes</Label>
            <Textarea
              id="generalNotes"
              placeholder="Enter any additional notes..."
              value={formData.generalNotes}
              onChange={(e) => handleInputChange('generalNotes', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={isPending}
              className="mt-4"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isPending && <Save className="mr-2 h-4 w-4" />}
              {medicalHistoryId ? "Update" : "Save & Next"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 