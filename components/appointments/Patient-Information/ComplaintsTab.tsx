"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetSymptoms } from "@/queries/symptoms/get-symptoms"
import { useCreateSymptom } from "@/queries/symptoms/create-symptom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X, Mic, Search } from "lucide-react"
import { toast } from "sonner"
import { useCreateComplaintDetail } from "@/queries/complaint/create-complaint-detail"
import { useGetComplaintByVisitId } from "@/queries/complaint/get-complaint-by-visit-id"
import { useUpdateComplaintDetail } from "@/queries/complaint/update-complaint-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useTabCompletion } from "@/context/TabCompletionContext"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useGetPatientById } from "@/queries/patients/get-patient-by-id"
import { Combobox } from "@/components/ui/combobox"

interface ComplaintsTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function ComplaintsTab({ patientId, appointmentId, onNext }: ComplaintsTabProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [rightSideSearchQuery, setRightSideSearchQuery] = useState("")
  const [notes, setNotes] = useState("")
  const { markTabAsCompleted, isTabCompleted } = useTabCompletion()

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    selectedSymptoms: [] as string[],
    notes: ""
  })
  
  // Get patient data to access breed information
  const { data: patientData } = useGetPatientById(patientId)
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get symptoms with species parameter (sent as breed)
  const { data: symptoms = [], isLoading } = useGetSymptoms(
    patientData?.species.toLowerCase() ? { breed: patientData.species.toLowerCase() } : undefined
  )
  const { data: existingComplaint, refetch: refetchComplaint } = useGetComplaintByVisitId(
    visitData?.id || ""
  )
  const { data: appointmentData } = useGetAppointmentById(appointmentId)
  
  // Initialize selected symptoms and notes from existing data
  useEffect(() => {
    if (existingComplaint) {
      const symptomIds = existingComplaint.symptoms.map(s => s.id)
      setSelectedSymptoms(symptomIds)
      setNotes(existingComplaint.notes || "")

      // Store original values for change detection
      setOriginalValues({
        selectedSymptoms: symptomIds,
        notes: existingComplaint.notes || ""
      })
    }
  }, [existingComplaint, markTabAsCompleted])

  // Show "Add new symptom" option when search query doesn't match any existing symptoms
  const hasExactMatch = symptoms.some(symptom => 
    symptom.name.toLowerCase() === rightSideSearchQuery.toLowerCase()
  )
  const showAddOption = rightSideSearchQuery.trim() && !hasExactMatch

  // Filter symptoms for right side (all symptoms with search, excluding common symptoms)
  const filteredRightSideSymptoms = symptoms.filter(symptom => 
    !symptom.isComman &&
    symptom.name.toLowerCase().includes(rightSideSearchQuery.toLowerCase())
  )

  // Get common symptoms
  const commonSymptoms = symptoms.filter(symptom => symptom.isComman)

  const createSymptomMutation = useCreateSymptom({
    onSuccess: () => {
      setRightSideSearchQuery("")
      toast.success("Symptom added successfully")
    },
    onError: (error) => {
      toast.error(`Failed to add symptom: ${error.message}`)
    }
  })

  const createComplaintMutation = useCreateComplaintDetail({
    onSuccess: () => {
      toast.success("Complaint details saved successfully")
      markTabAsCompleted("cc-hpi")
      refetchComplaint()
      if (onNext) onNext()
    },
    onError: (error) => {
      toast.error(`Failed to save complaint details: ${error.message}`)
    }
  })

  const updateComplaintMutation = useUpdateComplaintDetail({
    onSuccess: () => {
      toast.success("Complaint details updated successfully")
      markTabAsCompleted("cc-hpi")
      refetchComplaint()
      if (onNext) onNext()
    },
    onError: (error: any) => {
      toast.error(`Failed to update complaint details: ${error.message}`)
    }
  })

  const handleSymptomClick = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) 
        ? prev.filter(symId => symId !== id)
        : [...prev, id]
    )
  }

  const handleAddSymptom = (symptomName: string) => {
    if (symptomName.trim()) {
      createSymptomMutation.mutate({
        name: symptomName.trim(),
        breed: patientData?.species?.toLowerCase() || null
      }, {
        onSuccess: (newSymptom) => {
          setSelectedSymptoms((prev) => [...prev, newSymptom.id]);
        }
      });
    }
  };

  const handleSave = () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom before saving.")
      return
    }
    
    if (existingComplaint) {
      // Update existing complaint
      updateComplaintMutation.mutate({
        id: existingComplaint.id,
        symptomIds: selectedSymptoms,
        notes,
        isCompleted: true
      })
    } else {
      // Create new complaint
      createComplaintMutation.mutate({
        visitId: visitData.id,
        symptomIds: selectedSymptoms,
        notes,
        isCompleted: true
      })
    }
  }

  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const transcriber = useTranscriber()

  useEffect(() => {
    const output = transcriber.output
    if (output && !output.isBusy && output.text) {
      setNotes(prev => prev ? prev + "\n" + output.text : output.text)
    }
    // eslint-disable-next-line
  }, [transcriber.output?.isBusy])

  const isReadOnly = appointmentData?.status === "completed"

  // Check if any changes have been made to existing data
  const hasChanges = () => {
    if (!existingComplaint) return true // For new records, allow save if data exists

    const currentSymptoms = [...selectedSymptoms].sort()
    const originalSymptoms = [...originalValues.selectedSymptoms].sort()

    return (
      JSON.stringify(currentSymptoms) !== JSON.stringify(originalSymptoms) ||
      notes !== originalValues.notes
    )
  }

  if (visitLoading || isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading data...</p>
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
          <h2 className="text-lg font-semibold">Chief Complaint & History of Present Illness</h2>
        </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Common Symptoms */}
          <div>
            <h3 className="text-sm font-medium mb-3">Common Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom.id}
                  onClick={() => handleSymptomClick(symptom.id)}
                  className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  disabled={isReadOnly}
                >
                  {symptom.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - All Symptoms with Checkboxes */}
          <div>
            <h3 className="text-sm font-medium mb-3">All Symptoms</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search and Add new symptoms..."
                value={rightSideSearchQuery}
                onChange={(e) => setRightSideSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isReadOnly}
              />
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3">
              {/* Show "Add new symptom" option when search doesn't match existing symptoms */}
              {showAddOption && !isReadOnly && (
                <div 
                  className="flex items-center space-x-2 py-2 px-2 hover:bg-blue-50 cursor-pointer border-b border-gray-200 mb-2"
                  onClick={() => handleAddSymptom(rightSideSearchQuery)}
                >
                  <PlusCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    Add new symptom: "{rightSideSearchQuery}"
                  </span>
                </div>
              )}
              
              {filteredRightSideSymptoms.map(symptom => (
                <label key={symptom.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom.id)}
                    onChange={() => handleSymptomClick(symptom.id)}
                    disabled={isReadOnly}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{symptom.name}</span>
                </label>
              ))}
              
              {/* Show message when no symptoms found and no search query */}
              {filteredRightSideSymptoms.length === 0 && !showAddOption && rightSideSearchQuery && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No symptoms found matching "{rightSideSearchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Selected Symptoms:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map(id => {
                const symptom = symptoms.find(s => s.id === id)
                return symptom ? (
                  <div 
                    key={symptom.id}
                    className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm"
                  >
                    {symptom.name}
                    <button 
                      className="ml-2 hover:text-red-500"
                      onClick={() => handleSymptomClick(symptom.id)}
                      disabled={isReadOnly}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-1">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Notes
            </label>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setAudioModalOpen(true)}
              title="Record voice note"
              disabled={isReadOnly}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          <textarea
            className="w-full border rounded-md p-2 min-h-[100px]"
            placeholder="Add any additional details about the complaint..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isReadOnly}
          />
          <AudioManager
            open={audioModalOpen}
            onClose={() => setAudioModalOpen(false)}
            transcriber={transcriber}
            onTranscriptionComplete={(transcript: string) => {
              setNotes(prev => prev ? prev + "\n" + transcript : transcript)
              setAudioModalOpen(false)
            }}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={
              createComplaintMutation.isPending ||
              updateComplaintMutation.isPending ||
              selectedSymptoms.length === 0 ||
              isReadOnly ||
              (!!existingComplaint && !hasChanges())
            }
            className="ml-2"
          >
            {createComplaintMutation.isPending || updateComplaintMutation.isPending
              ? "Saving..."
              : existingComplaint ? "Update & Next" : "Save & Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}