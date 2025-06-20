"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetSymptoms } from "@/queries/symptoms/get-symptoms"
import { useCreateSymptom } from "@/queries/symptoms/create-symptom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X } from "lucide-react"
import { toast } from "sonner"
import { useCreateComplaintDetail } from "@/queries/complaint/create-complaint-detail"
import { useGetComplaintByVisitId } from "@/queries/complaint/get-complaint-by-visit-id"
import { useUpdateComplaintDetail } from "@/queries/complaint/update-complaint-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useTabCompletion } from "@/context/TabCompletionContext"

interface ComplaintsTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function ComplaintsTab({ patientId, appointmentId, onNext }: ComplaintsTabProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [isAddingSymptom, setIsAddingSymptom] = useState(false)
  const [newSymptomName, setNewSymptomName] = useState("")
  const [notes, setNotes] = useState("")
  const { markTabAsCompleted, isTabCompleted } = useTabCompletion()
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  const { data: symptoms = [], isLoading } = useGetSymptoms()
  const { data: existingComplaint, refetch: refetchComplaint } = useGetComplaintByVisitId(
    visitData?.id || ""
  )
  
  // Initialize selected symptoms and notes from existing data
  useEffect(() => {
    if (existingComplaint) {
      setSelectedSymptoms(existingComplaint.symptoms.map(s => s.id))
      if (existingComplaint.notes) {
        setNotes(existingComplaint.notes)
      }
      
      // If complaint is marked as completed, update the tab completion status
      if (existingComplaint.isCompleted) {
        markTabAsCompleted("cc-hpi");
      }
    }
  }, [existingComplaint, markTabAsCompleted])
  
  const createSymptomMutation = useCreateSymptom({
    onSuccess: () => {
      setNewSymptomName("")
      setIsAddingSymptom(false)
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
    if (newSymptomName.trim()) {
      createSymptomMutation.mutate({
        name: newSymptomName.trim()
      })
    }
  }

  const handleSave = () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chief Complaint & History of Present Illness</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddingSymptom(!isAddingSymptom)}
          >
            <PlusCircle className="h-4 w-4" /> 
            Add Symptom
          </Button>
        </div>

        {isAddingSymptom && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Enter new symptom name"
              value={newSymptomName}
              onChange={(e) => setNewSymptomName(e.target.value)}
              className="max-w-md"
            />
            <Button 
              onClick={handleAddSymptom}
              disabled={!newSymptomName.trim() || createSymptomMutation.isPending}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsAddingSymptom(false)
                setNewSymptomName("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="py-4 text-sm text-muted-foreground">Loading symptoms...</div>
        ) : (
          <>
            {selectedSymptoms.length > 0 && (
              <div className="mb-4">
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
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">All Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => handleSymptomClick(symptom.id)}
                    className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {symptom.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
              <textarea
                className="w-full border rounded-md p-2 min-h-[100px]"
                placeholder="Add any additional details about the complaint..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={createComplaintMutation.isPending || updateComplaintMutation.isPending}
                className="ml-2"
              >
                {createComplaintMutation.isPending || updateComplaintMutation.isPending 
                  ? "Saving..." 
                  : existingComplaint ? "Update" : "Save and Next"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 