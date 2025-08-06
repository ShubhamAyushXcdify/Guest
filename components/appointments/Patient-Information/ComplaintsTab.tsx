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
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [notes, setNotes] = useState("")
  const { markTabAsCompleted, isTabCompleted } = useTabCompletion()
  
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
      setSelectedSymptoms(existingComplaint.symptoms.map(s => s.id))
      if (existingComplaint.notes) {
        setNotes(existingComplaint.notes)
      }
      
    }
  }, [existingComplaint, markTabAsCompleted])

  // Filter symptoms for typeahead (exclude already selected and common symptoms)
  const filteredSymptoms = symptoms.filter(symptom => 
    !selectedSymptoms.includes(symptom.id) && 
    !symptom.isComman &&
    symptom.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get common symptoms
  const commonSymptoms = symptoms.filter(symptom => symptom.isComman)

  const createSymptomMutation = useCreateSymptom({
    onSuccess: () => {
      setSearchQuery("")
      setShowDropdown(false)
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

  const handleAddSymptom = () => {
    if (searchQuery.trim()) {
      createSymptomMutation.mutate({
        name: searchQuery.trim(),
        breed: patientData?.species?.toLowerCase() || null
      })
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowDropdown(value.length > 0)
  }

  const handleSelectSymptom = (symptomId: string) => {
    handleSymptomClick(symptomId)
    setSearchQuery("")
    setShowDropdown(false)
  }

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
          {/* Left side - Typeahead search */}
          <div>
            <h3 className="text-sm font-medium mb-3">Search Symptoms</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for symptoms..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowDropdown(searchQuery.length > 0)}
                className="pl-10 pr-10"
                disabled={isReadOnly}
              />
              <PlusCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              
              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredSymptoms.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      {searchQuery.trim() ? (
                        <div className="flex flex-col gap-2">
                          <span>No symptoms found</span>
                          <Button
                            size="sm"
                            onClick={handleAddSymptom}
                            disabled={createSymptomMutation.isPending || isReadOnly}
                            className="w-full"
                          >
                            Add "{searchQuery}" as new symptom
                          </Button>
                        </div>
                      ) : (
                        "Start typing to search symptoms"
                      )}
                    </div>
                  ) : (
                    <div className="py-1">
                      {filteredSymptoms.map((symptom) => (
                        <button
                          key={symptom.id}
                          onClick={() => handleSelectSymptom(symptom.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                          disabled={isReadOnly}
                        >
                          {symptom.name}
                        </button>
                      ))}
                      {searchQuery.trim() && (
                        <div className="border-t pt-2 px-3">
                          <Button
                            size="sm"
                            onClick={handleAddSymptom}
                            disabled={createSymptomMutation.isPending || isReadOnly}
                            className="w-full"
                          >
                            Add "{searchQuery}" as new symptom
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Common Symptoms */}
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
        </div>

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
            disabled={createComplaintMutation.isPending || updateComplaintMutation.isPending || selectedSymptoms.length === 0 || isReadOnly}
            className="ml-2"
          >
            {createComplaintMutation.isPending || updateComplaintMutation.isPending 
              ? "Saving..." 
              : existingComplaint ? "Update" : "Save and Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}