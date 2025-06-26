"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetProcedures } from "@/queries/procedure/get-procedures"
import { useCreateProcedure } from "@/queries/procedure/create-procedure"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X } from "lucide-react"
import { toast } from "sonner"
import { useCreateProcedureDetail } from "@/queries/ProcedureDetails/create-procedure-detail"
import { useGetProcedureDetailByVisitId } from "@/queries/ProcedureDetails/get-procedure-detail-by-visit-id"
import { useUpdateProcedureDetail } from "@/queries/ProcedureDetails/update-procedure-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useTabCompletion } from "@/context/TabCompletionContext"

interface ProcedureTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function ProcedureTab({ patientId, appointmentId, onNext }: ProcedureTabProps) {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])
  const [isAddingProcedure, setIsAddingProcedure] = useState(false)
  const [newProcedureName, setNewProcedureName] = useState("")
  const [notes, setNotes] = useState("")
  const { markTabAsCompleted } = useTabCompletion()
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  const { data: procedures = [], isLoading } = useGetProcedures()
  const { data: existingProcedureDetail, refetch: refetchProcedureDetail } = useGetProcedureDetailByVisitId(
    visitData?.id || ""
  )
  
  // Initialize selected procedures and notes from existing data
  useEffect(() => {
    if (existingProcedureDetail) {
      // Check if procedures array exists before accessing it
      if (existingProcedureDetail.procedures && Array.isArray(existingProcedureDetail.procedures)) {
        setSelectedProcedures(existingProcedureDetail.procedures.map(p => p.id));
      }
      
      if (existingProcedureDetail.notes) {
        setNotes(existingProcedureDetail.notes);
      }
      
      // Mark tab as completed if it was already completed or if it has procedures
      if (existingProcedureDetail.isCompleted || 
          (existingProcedureDetail.procedures && 
           existingProcedureDetail.procedures.length > 0)) {
        markTabAsCompleted("procedure");
      }
    }
<<<<<<< dev-XC-PA-XX-20
  }, [existingProcedureDetail, markTabAsCompleted]);
  
  // Separate effect for marking the tab as completed based on selectedProcedures
  useEffect(() => {
    if (selectedProcedures.length > 0) {
      markTabAsCompleted("procedure");
    }
  }, [selectedProcedures, markTabAsCompleted]);
=======
  }, [existingProcedureDetail, markTabAsCompleted])
>>>>>>> dev
  
  const createProcedureMutation = useCreateProcedure({
    onSuccess: () => {
      setNewProcedureName("")
      setIsAddingProcedure(false)
      toast.success("Procedure added successfully")
    },
    onError: (error) => {
      toast.error(`Failed to add procedure: ${error.message}`)
    }
  })

  // Use mutateAsync pattern like MedicalHistoryTab
  const { mutateAsync: createProcedureDetail, isPending: isCreating } = useCreateProcedureDetail()
  const { mutateAsync: updateProcedureDetail, isPending: isUpdating } = useUpdateProcedureDetail()
  
  // Combined loading state
  const isPending = isCreating || isUpdating

  const handleProcedureClick = (id: string) => {
    setSelectedProcedures(prev => 
      prev.includes(id) 
        ? prev.filter(procId => procId !== id)
        : [...prev, id]
    )
  }

  const handleAddProcedure = () => {
    if (newProcedureName.trim()) {
      createProcedureMutation.mutate({
        name: newProcedureName.trim()
      })
    }
  }

  const handleSave = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    
    try {
      if (existingProcedureDetail) {
        // Update with ID in the payload as required by the API
        await updateProcedureDetail({
          id: existingProcedureDetail.id,
          notes: notes || "",
          isCompleted: true,
          procedureIds: selectedProcedures
        })
        
        toast.success("Procedure details updated successfully")
      } else {
        // Create new procedure detail
        await createProcedureDetail({
          visitId: visitData.id,
          notes: notes || "",
          isCompleted: true,
          procedureIds: selectedProcedures
        })
        
        toast.success("Procedure details saved successfully")
      }
      
      // Mark the tab as completed
      markTabAsCompleted("procedure")
      
      // After successful save, navigate to next tab
      if (onNext) {
        onNext()
      }
      
    } catch (error) {
      console.error('Error saving procedure details:', error)
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          <h2 className="text-lg font-semibold">Procedures</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddingProcedure(!isAddingProcedure)}
          >
            <PlusCircle className="h-4 w-4" /> 
            Add Procedure
          </Button>
        </div>

        {isAddingProcedure && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Enter new procedure name"
              value={newProcedureName}
              onChange={(e) => setNewProcedureName(e.target.value)}
              className="max-w-md"
            />
            <Button 
              onClick={handleAddProcedure}
              disabled={!newProcedureName.trim() || createProcedureMutation.isPending}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsAddingProcedure(false)
                setNewProcedureName("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="py-4 text-sm text-muted-foreground">Loading procedures...</div>
        ) : (
          <>
            {selectedProcedures.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Selected Procedures:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProcedures.map(id => {
                    const procedure = procedures.find(p => p.id === id)
                    return procedure ? (
                      <div 
                        key={procedure.id}
                        className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm"
                      >
                        {procedure.name}
                        <button 
                          className="ml-2 hover:text-red-500"
                          onClick={() => handleProcedureClick(procedure.id)}
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
              <h3 className="text-sm font-medium mb-2">All Procedures</h3>
              <div className="flex flex-wrap gap-2">
                {procedures.map(procedure => (
                  <button
                    key={procedure.id}
                    onClick={() => handleProcedureClick(procedure.id)}
                    className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                      selectedProcedures.includes(procedure.id)
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {procedure.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
              <textarea
                className="w-full border rounded-md p-2 min-h-[100px]"
                placeholder="Add any additional details about the procedures..."
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
                  : existingProcedureDetail ? "Update" : "Save and Next"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}