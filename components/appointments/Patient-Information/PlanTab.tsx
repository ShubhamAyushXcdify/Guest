"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useGetPlans } from "@/queries/Plan/get-plans"
import { useCreatePlan } from "@/queries/Plan/create-plan"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X } from "lucide-react"
import { toast } from "sonner"
import { useCreatePlanDetail } from "@/queries/PlanDetail/create-plan-detail"
import { useGetPlanDetailByVisitId } from "@/queries/PlanDetail/get-plan-detail-by-visit-id"
import { useUpdatePlanDetail } from "@/queries/PlanDetail/update-plan-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"

interface PlanTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function PlanTab({ patientId, appointmentId, onNext }: PlanTabProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [isAddingPlan, setIsAddingPlan] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [notes, setNotes] = useState("")
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  const { data: plans = [], isLoading, refetch: refetchPlans } = useGetPlans()
  const { data: existingPlanDetail, refetch: refetchPlanDetail } = useGetPlanDetailByVisitId(
    visitData?.id || ""
  )
  
  // Initialize selected plans and notes from existing data
  useEffect(() => {
    if (existingPlanDetail) {
      setSelectedPlans(existingPlanDetail.plans.map(p => p.id))
      if (existingPlanDetail.notes) {
        setNotes(existingPlanDetail.notes)
      }
    }
  }, [existingPlanDetail])
  
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
      if (onNext) onNext()
    },
    onError: (error) => {
      toast.error(`Failed to save plan details: ${error.message}`)
    }
  })

  const updatePlanDetailMutation = useUpdatePlanDetail({
    onSuccess: () => {
      toast.success("Plan details updated successfully")
      refetchPlanDetail()
      if (onNext) onNext()
    },
    onError: (error: any) => {
      toast.error(`Failed to update plan details: ${error.message}`)
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

  const handleSave = () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    
    if (existingPlanDetail) {
      // Update existing plan detail
      updatePlanDetailMutation.mutate({
        id: existingPlanDetail.id,
        planIds: selectedPlans,
        notes,
        isCompleted: true
      })
    } else {
      // Create new plan detail
      createPlanDetailMutation.mutate({
        visitId: visitData.id,
        planIds: selectedPlans,
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
          <h2 className="text-lg font-semibold">Treatment Plan</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddingPlan(!isAddingPlan)}
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
            />
            <Button 
              onClick={handleAddPlan}
              disabled={!newPlanName.trim() || createPlanMutation.isPending}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsAddingPlan(false)
                setNewPlanName("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                  >
                    {plan.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
              <textarea
                className="w-full border rounded-md p-2 min-h-[100px]"
                placeholder="Add any additional details about the treatment plan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={createPlanDetailMutation.isPending || updatePlanDetailMutation.isPending}
                className="ml-2"
              >
                {createPlanDetailMutation.isPending || updatePlanDetailMutation.isPending 
                  ? "Saving..." 
                  : existingPlanDetail ? "Update" : "Save & Next"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 