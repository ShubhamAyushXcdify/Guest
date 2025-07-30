"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetPlans } from "@/queries/Plan/get-plans"
import { useCreatePlan } from "@/queries/Plan/create-plan"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X, CheckCircle, AlertCircle, Mic } from "lucide-react"
import { toast } from "sonner"
import { useCreatePlanDetail } from "@/queries/PlanDetail/create-plan-detail"
import { useGetPlanDetailByVisitId } from "@/queries/PlanDetail/get-plan-detail-by-visit-id"
import { useUpdatePlanDetail } from "@/queries/PlanDetail/update-plan-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useUpdateAppointment } from "@/queries/appointment/update-appointment"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTabCompletion } from "@/context/TabCompletionContext"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"

// Interface for extended visit data
interface ExtendedVisitData {
  isIntakeCompleted: boolean;
  isComplaintsCompleted: boolean;
  isVitalsCompleted: boolean;
  isProceduresCompleted: boolean;
  isPrescriptionCompleted: boolean;
  isPlanCompleted: boolean;
}

interface PlanTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
  onClose?: () => void
}

export default function PlanTab({ patientId, appointmentId, onNext, onClose }: PlanTabProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [isAddingPlan, setIsAddingPlan] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { markTabAsCompleted, allTabsCompleted, completedTabs } = useTabCompletion()
  const [areAllTabsCompleted, setAreAllTabsCompleted] = useState(false)
  
  const completionCheckRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get appointment data
  const { data: appointmentData } = useGetAppointmentById(appointmentId)
  
  // Check if appointment is already completed
  const isAppointmentCompleted = appointmentData?.status === "completed"
  
  const { data: plans = [], isLoading, refetch: refetchPlans } = useGetPlans()
  const { data: existingPlanDetail, refetch: refetchPlanDetail } = useGetPlanDetailByVisitId(
    visitData?.id || ""
  )
  const { mutateAsync: createPlanDetail, isPending: isCreating } = useCreatePlanDetail()
  const { mutateAsync: updatePlanDetail, isPending: isUpdating } = useUpdatePlanDetail()
  
  // Combined loading state
  const isPending = isCreating || isUpdating

  // Function to check if all visit tabs are completed
  const areAllVisitTabsCompleted = (): boolean => {
    if (!visitData) return false;
    
    // Cast visitData to access all completion properties
    const visit = visitData as unknown as ExtendedVisitData;
    
    return (
      visit.isIntakeCompleted &&
      visit.isComplaintsCompleted &&
      visit.isVitalsCompleted &&
      visit.isProceduresCompleted &&
      visit.isPrescriptionCompleted
      // Note: We don't check isPlanCompleted here as that's the current tab
    );
  };
  
  // Initialize selected plans and notes from existing data
  useEffect(() => {
    if (existingPlanDetail) {
      setSelectedPlans(existingPlanDetail.plans.map(p => p.id))
      if (existingPlanDetail.notes) {
        setNotes(existingPlanDetail.notes)
      }
      
      // Mark plan tab as completed if it was already completed
      if (existingPlanDetail.isCompleted) {
        markTabAsCompleted("plan")
      }
    }
    
    // Also check if the plan tab is completed based on visitData
    if (visitData) {
      const visit = visitData as unknown as ExtendedVisitData;
      if (visit.isPlanCompleted) {
        markTabAsCompleted("plan")
      }
    }
  }, [existingPlanDetail, visitData, markTabAsCompleted])
  
  // Update allTabsCompleted state when tabs are completed
  useEffect(() => {
    // Use a delayed check to ensure all tab completion updates have been processed
    if (completionCheckRef.current) {
      clearTimeout(completionCheckRef.current)
    }
    
    completionCheckRef.current = setTimeout(() => {
      const checkResult = allTabsCompleted()
      setAreAllTabsCompleted(checkResult)
    }, 100)
    
    return () => {
      if (completionCheckRef.current) {
        clearTimeout(completionCheckRef.current)
      }
    }
  }, [completedTabs, allTabsCompleted])
  
  const createPlanMutation = useCreatePlan({
    onSuccess: () => {
      setNewPlanName("")
      setIsAddingPlan(false)
      // Explicitly refetch plans to update the UI immediately
      refetchPlans()
      toast.success("Plan added successfully")
    },
    onError: (error) => {
      toast.error(`Failed to add plan: ${error.message}`)
    }
  })

  const createPlanDetailMutation = useCreatePlanDetail({
    onSuccess: () => {
      toast.success("Plan details saved successfully")
      refetchPlanDetail()
      markTabAsCompleted("plan")
    },
    onError: (error) => {
      toast.error(`Failed to save plan details: ${error.message}`)
      setIsProcessing(false)
    }
  })

  const updatePlanDetailMutation = useUpdatePlanDetail({
    onSuccess: () => {
      toast.success("Plan details updated successfully")
      refetchPlanDetail()
      markTabAsCompleted("plan")
    },
    onError: (error: any) => {
      toast.error(`Failed to update plan details: ${error.message}`)
      setIsProcessing(false)
    }
  })
  
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast.success("Visit completed successfully")
      setIsProcessing(false)
    },
    onError: (error) => {
      toast.error(`Failed to update appointment status: ${error.message}`)
      setIsProcessing(false)
    }
  })

  const handlePlanClick = (id: string) => {
    setSelectedPlans(prev => 
      prev.includes(id) 
        ? prev.filter(planId => planId !== id)
        : [...prev, id]
    )
  }

  const handleAddPlan = () => {
    if (newPlanName.trim()) {
      createPlanMutation.mutate({
        name: newPlanName.trim()
      })
    }
  }

  // Track whether the plan has been saved and checkout has been initiated
  const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false)

  // Save or update plan detail (for Save/Update button)
  const handleSave = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    if (selectedPlans.length === 0) {
      toast.error("Please select at least one plan before saving.")
      return
    }
    try {
      if (existingPlanDetail) {
        await updatePlanDetailMutation.mutateAsync({
          id: existingPlanDetail.id,
          planIds: selectedPlans,
          notes,
          isCompleted: true
        })
      } else {
        await createPlanDetailMutation.mutateAsync({
          visitId: visitData.id,
          planIds: selectedPlans,
          notes,
          isCompleted: true
        })
      }
      toast.success("Plan details saved successfully")
    } catch (error) {
      toast.error(`Failed to save plan details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCheckout = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    if (!appointmentData) {
      toast.error("No appointment data found")
      return
    }
    // Check if all required tabs have been completed using visitData
    if (!isAppointmentCompleted && !areAllVisitTabsCompleted()) {
      toast.error("Please complete all tabs before checking out")
      return
    }
    setIsProcessing(true)
    setHasInitiatedCheckout(true)
    try {
      // First save the plan details as completed
      if (existingPlanDetail) {
        await updatePlanDetailMutation.mutateAsync({
          id: existingPlanDetail.id,
          planIds: selectedPlans,
          notes,
          isCompleted: true
        })
      } else {
        await createPlanDetailMutation.mutateAsync({
          visitId: visitData.id,
          planIds: selectedPlans,
          notes,
          isCompleted: true
        })
      }
      // Only update appointment status if not already completed
      if (!isAppointmentCompleted) {
        await updateAppointmentMutation.mutateAsync({
          id: appointmentId,
          data: {
            ...appointmentData,
            status: "completed"
          }
        })
      }
      // Ensure we close the form immediately after successful completion
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Error during checkout process:", error)
      setIsProcessing(false)
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
  
  // Check all tabs completion state for UI display
  const allVisitTabsComplete = areAllVisitTabsCompleted();
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Treatment Plan</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddingPlan(!isAddingPlan)}
            disabled={isReadOnly}
          >
            <PlusCircle className="h-4 w-4" /> 
            Add Plan
          </Button>
        </div>

        {isAddingPlan && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Enter new plan name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              className="max-w-md"
              disabled={isReadOnly}
            />
            <Button 
              onClick={handleAddPlan}
              disabled={!newPlanName.trim() || createPlanMutation.isPending || isReadOnly}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsAddingPlan(false)
                setNewPlanName("")
              }}
              disabled={isReadOnly}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Only show the warning if appointment isn't already completed and not all tabs are complete */}
        {!isAppointmentCompleted && !allVisitTabsComplete && (
          <Alert variant="default" className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Incomplete Patient Information</AlertTitle>
            <AlertDescription>
              Please complete all tabs before checking out the patient. 
              Tabs that are completed will show in green.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="py-4 text-sm text-muted-foreground">Loading plans...</div>
        ) : (
          <>
            {selectedPlans.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Selected Plans:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPlans.map(id => {
                    const plan = plans.find(p => p.id === id)
                    return plan ? (
                      <div 
                        key={plan.id}
                        className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm"
                      >
                        {plan.name}
                        <button 
                          className="ml-2 hover:text-red-500"
                          onClick={() => handlePlanClick(plan.id)}
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

            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">All Plans</h3>
              <div className="flex flex-wrap gap-2">
                {plans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanClick(plan.id)}
                    className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                      selectedPlans.includes(plan.id)
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    disabled={isReadOnly}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-row items-center gap-2 mb-2">
                <h3 className="text-sm font-medium">Additional Notes</h3>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setAudioModalOpen(true)}
                  title="Record voice note"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
              <textarea
                className="w-full border rounded-md p-2 min-h-[100px]"
                placeholder="Add any additional details about the treatment plan..."
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

            <div className="mt-6 flex justify-end gap-2">
              <Button 
                onClick={handleSave}
                disabled={isPending || selectedPlans.length === 0 || isReadOnly}
                className="ml-2"
              >
                {isPending ? "Saving..." : existingPlanDetail ? "Update" : "Save"}
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={isPending || !allVisitTabsComplete || selectedPlans.length === 0 || isReadOnly || !completedTabs.includes("plan")}
                className="ml-2 bg-green-600 hover:bg-green-700 text-white"
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}