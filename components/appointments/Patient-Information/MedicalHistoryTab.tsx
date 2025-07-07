"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, Mic } from "lucide-react"
import { 
  useGetMedicalHistoryDetailByVisitId, 
  useCreateMedicalHistoryDetail, 
  useUpdateMedicalHistoryDetail,
  MedicalHistoryDetail
} from "@/queries/MedicalHistoryDetail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useTabCompletion } from "@/context/TabCompletionContext"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"

interface MedicalHistoryTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function MedicalHistoryTab({ patientId, appointmentId, onNext }: MedicalHistoryTabProps) {
  const { toast } = useToast()
  const { markTabAsCompleted } = useTabCompletion()
  const [formData, setFormData] = useState<Partial<MedicalHistoryDetail>>({
    chronicConditionsNotes: '',
    surgeriesNotes: '',
    currentMedicationsNotes: '',
    generalNotes: '',
    isCompleted: false,
  })
  const [medicalHistoryId, setMedicalHistoryId] = useState<string | null>(null)
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const [activeField, setActiveField] = useState<keyof MedicalHistoryDetail | null>(null)
  
  const transcriber = useTranscriber()

  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get medical history data by visitId if we have a visit
  const { data: medicalHistoryDetail, isLoading: historyLoading } = useGetMedicalHistoryDetailByVisitId(
    visitData?.id || ""
  )
  const { data: appointmentData } = useGetAppointmentById(appointmentId)
  
  const { mutateAsync: createMedicalHistory, isPending: isCreating } = useCreateMedicalHistoryDetail()
  const { mutateAsync: updateMedicalHistory, isPending: isUpdating } = useUpdateMedicalHistoryDetail()

  const isPending = isCreating || isUpdating || visitLoading

  const isReadOnly = appointmentData?.status === "completed"

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
      
      // Mark tab as completed if data exists and is completed
      if (medicalHistoryDetail.isCompleted) {
        markTabAsCompleted("medical-history")
      }
    }
  }, [medicalHistoryDetail, markTabAsCompleted])

  // Handle transcription output
  useEffect(() => {
    const output = transcriber.output
    if (output && !output.isBusy && output.text && activeField) {
      setFormData(prev => ({
        ...prev,
        [activeField]: prev[activeField] ? prev[activeField] + "\n" + output.text : output.text
      }))
    }
    // eslint-disable-next-line
  }, [transcriber.output?.isBusy])

  const handleInputChange = (field: keyof MedicalHistoryDetail, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOpenAudioModal = (field: keyof MedicalHistoryDetail) => {
    setActiveField(field)
    setAudioModalOpen(true)
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
      
      // Set isCompleted to true when saving
      const updatedFormData = {
        ...formData,
        isCompleted: true
      }
      
      if (medicalHistoryId) {
        await updateMedicalHistory({
          id: medicalHistoryId,
          ...updatedFormData,
          visitId: visitData.id,
        })
        toast({
          title: "Medical history updated",
          description: "Medical history has been updated successfully.",
        })
      } else {
        const result = await createMedicalHistory({
          ...updatedFormData,
          visitId: visitData.id,
        })
        setMedicalHistoryId(result.id)
        toast({
          title: "Medical history created",
          description: "Medical history has been created successfully.",
        })
      }
      
      // Mark the tab as completed
      markTabAsCompleted("medical-history")
      
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
            <div className="flex items-center gap-2">
              <Label htmlFor="chronicConditions">Chronic Conditions</Label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleOpenAudioModal('chronicConditionsNotes')}
                title="Record voice note"
                disabled={isReadOnly}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              id="chronicConditions"
              placeholder="Enter any chronic conditions..."
              value={formData.chronicConditionsNotes}
              onChange={(e) => handleInputChange('chronicConditionsNotes', e.target.value)}
              className="min-h-[100px]"
              disabled={isReadOnly}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="surgeries">Surgeries</Label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleOpenAudioModal('surgeriesNotes')}
                title="Record voice note"
                disabled={isReadOnly}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              id="surgeries"
              placeholder="Enter any surgeries..."
              value={formData.surgeriesNotes}
              onChange={(e) => handleInputChange('surgeriesNotes', e.target.value)}
              className="min-h-[100px]"
              disabled={isReadOnly}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleOpenAudioModal('currentMedicationsNotes')}
                title="Record voice note"
                disabled={isReadOnly}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              id="currentMedications"
              placeholder="Enter current medications..."
              value={formData.currentMedicationsNotes}
              onChange={(e) => handleInputChange('currentMedicationsNotes', e.target.value)}
              className="min-h-[100px]"
              disabled={isReadOnly}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="generalNotes">General Notes</Label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => handleOpenAudioModal('generalNotes')}
                title="Record voice note"
                disabled={isReadOnly}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              id="generalNotes"
              placeholder="Enter any additional notes..."
              value={formData.generalNotes}
              onChange={(e) => handleInputChange('generalNotes', e.target.value)}
              className="min-h-[100px]"
              disabled={isReadOnly}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={isPending || isReadOnly}
              className="mt-4"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isPending && <Save className="mr-2 h-4 w-4" />}
              {medicalHistoryId ? "Update" : "Save & Next"}
            </Button>
          </div>
        </div>

        <AudioManager
          open={audioModalOpen}
          onClose={() => setAudioModalOpen(false)}
          transcriber={transcriber}
          onTranscriptionComplete={(transcript: string) => {
            if (activeField) {
              setFormData(prev => ({
                ...prev,
                [activeField]: prev[activeField] ? prev[activeField] + "\n" + transcript : transcript
              }))
            }
            setAudioModalOpen(false)
          }}
        />
      </CardContent>
    </Card>
  )
}