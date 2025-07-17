"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetProcedures } from "@/queries/procedure/get-procedures"
import { useCreateProcedure } from "@/queries/procedure/create-procedure"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X, Mic, Search, FileText } from "lucide-react"
import { toast } from "sonner"
import { useCreateProcedureDetail } from "@/queries/ProcedureDetails/create-procedure-detail"
import { useGetProcedureDetailByVisitId } from "@/queries/ProcedureDetails/get-procedure-detail-by-visit-id"
import { useUpdateProcedureDetail } from "@/queries/ProcedureDetails/update-procedure-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useTabCompletion } from "@/context/TabCompletionContext"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import UrinalysisModal from "./modals/UrinalysisModal"

interface ProcedureTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function ProcedureTab({ patientId, appointmentId, onNext }: ProcedureTabProps) {
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([])
  const [newProcedureName, setNewProcedureName] = useState("")
  const [notes, setNotes] = useState("")
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const [urinalysisModalOpen, setUrinalysisModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { markTabAsCompleted } = useTabCompletion()
  
  const transcriber = useTranscriber()
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  const { data: procedures = [], isLoading } = useGetProcedures()
  const { data: existingProcedureDetail, refetch: refetchProcedureDetail } = useGetProcedureDetailByVisitId(
    visitData?.id || ""
  )
  const { data: appointmentData } = useGetAppointmentById(appointmentId)

  // Filter procedures based on search query (excluding already selected ones)
  const filteredProcedures = procedures.filter(procedure => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = (
      procedure.name.toLowerCase().includes(query) ||
      procedure.procCode?.toLowerCase().includes(query) ||
      procedure.type?.toLowerCase().includes(query)
    )
    // Only show procedures that are not already selected
    return matchesSearch && !selectedProcedures.includes(procedure.id)
  })

  // Get selected procedures data
  const selectedProceduresData = procedures.filter(procedure => 
    selectedProcedures.includes(procedure.id)
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
  }, [existingProcedureDetail, markTabAsCompleted])
  
  // Handle transcription output
  useEffect(() => {
    const output = transcriber.output
    if (output && !output.isBusy && output.text) {
      setNotes(prev => prev ? prev + "\n" + output.text : output.text)
    }
    // eslint-disable-next-line
  }, [transcriber.output?.isBusy])
  
  const createProcedureMutation = useCreateProcedure({
    onSuccess: () => {
      setNewProcedureName("")
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

  const isReadOnly = appointmentData?.status === "completed"

  const handleProcedureClick = (id: string) => {
    const procedure = procedures.find(p => p.id === id)
    setSelectedProcedures(prev => 
      prev.includes(id) 
        ? prev.filter(procId => procId !== id)
        : [...prev, id]
    )
  }

  const handleRemoveProcedure = (id: string) => {
    setSelectedProcedures(prev => prev.filter(procId => procId !== id))
  }

  const handleDocumentClick = (id: string) => {
    const procedure = procedures.find(p => p.id === id)
    if (procedure?.procCode === "DIAURI002") {
      setUrinalysisModalOpen(true)
      return
    }
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
        {/* Search and Add Procedures Section */}
        <div className="mb-6">
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search procedures by name, code, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="py-4 text-sm text-muted-foreground">Loading procedures...</div>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Procedure Code</TableHead>
                    <TableHead>Procedure Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcedures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No procedures found matching your search." : "No procedures available to select."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProcedures.map(procedure => (
                      <TableRow key={procedure.id}>
                        <TableCell className="font-mono text-sm">
                          {procedure.procCode || "-"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{procedure.name}</div>
                            {procedure.notes && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {procedure.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {procedure.type || "General"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProcedureClick(procedure.id)}
                            disabled={isReadOnly}
                            className="w-full"
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Selected Procedures Table */}
        {selectedProceduresData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Selected Procedures</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Procedure Code</TableHead>
                    <TableHead>Procedure Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProceduresData.map(procedure => (
                    <TableRow key={procedure.id}>
                      <TableCell className="font-mono text-sm">
                        {procedure.procCode || "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{procedure.name}</div>
                          {procedure.notes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {procedure.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {procedure.type || "General"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentClick(procedure.id)}
                            disabled={isReadOnly}
                            title="View/Edit Documents"
                          >
                            Document
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveProcedure(procedure.id)}
                            disabled={isReadOnly}
                            title="Remove Procedure"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium">Additional Notes</h3>
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
            placeholder="Add any additional details about the procedures..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isPending || selectedProcedures.length === 0 || isReadOnly}
            className="ml-2"
          >
            {isPending 
              ? "Saving..." 
              : existingProcedureDetail ? "Update" : "Save and Next"}
          </Button>
        </div>
        
        <AudioManager
          open={audioModalOpen}
          onClose={() => setAudioModalOpen(false)}
          transcriber={transcriber}
          onTranscriptionComplete={(transcript: string) => {
            setNotes(prev => prev ? prev + "\n" + transcript : transcript)
            setAudioModalOpen(false)
          }}
        />
        
        <UrinalysisModal
          open={urinalysisModalOpen}
          onClose={() => setUrinalysisModalOpen(false)}
          patientId={patientId}
          appointmentId={appointmentId}
        />
      </CardContent>
    </Card>
  )
}