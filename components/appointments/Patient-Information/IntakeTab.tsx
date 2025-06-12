"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useGetIntakeByVisitId } from "@/queries/intake/get-intake-by-visit-id"
import { useCreateIntakeDetail } from "@/queries/intake/create-intake-detail"
import { useUpdateIntakeDetail } from "@/queries/intake/update-intake-detail"
import { Plus, Trash, Upload, Image } from "lucide-react"

interface IntakeTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function IntakeTab({ patientId, appointmentId, onNext }: IntakeTabProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State to track if we have an intake
  const [hasIntake, setHasIntake] = useState(false)
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get intake data by visitId if we have a visit
  const { data: intakeData, isLoading: intakeLoading, refetch: refetchIntake } = useGetIntakeByVisitId(
    visitData?.id || ""
  )
  
  // Intake tab state
  const [weightKg, setWeightKg] = useState<number | undefined>(undefined)
  const [imagePaths, setImagePaths] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [notes, setNotes] = useState("")

  const createIntakeMutation = useCreateIntakeDetail({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Intake detail saved successfully",
      })
      // Refetch intake data
      refetchIntake();
      setHasIntake(true);
      
      // Navigate to next tab if provided
      if (onNext) {
        onNext();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save intake detail",
        variant: "destructive",
      })
    }
  })

  const updateIntakeMutation = useUpdateIntakeDetail({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Intake detail updated successfully",
      })
      // Refetch intake data
      refetchIntake();
      
      // Navigate to next tab if provided
      if (onNext) {
        onNext();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update intake detail",
        variant: "destructive",
      })
    }
  })

  // Initialize form with existing data when available
  useEffect(() => {
    if (intakeData) {
      setWeightKg(intakeData.weightKg)
      setImagePaths(intakeData.imagePaths || [])
      setNotes(intakeData.notes || "")
      setHasIntake(true)
    }
  }, [intakeData])

  const handleSaveIntake = () => {
    if (!visitData?.id) {
      toast({
        title: "Error",
        description: "No visit data found for this appointment",
        variant: "destructive",
      })
      return
    }
    
    if (hasIntake && intakeData?.id) {
      // Update existing intake
      updateIntakeMutation.mutate({
        id: intakeData.id,
        visitId: intakeData.visitId || visitData?.id,
        weightKg: weightKg!,
        imagePaths,
        notes,
        isCompleted: true
      })
    } else {
      // Create new intake
      createIntakeMutation.mutate({
        visitId: visitData.id,
        weightKg: weightKg!,
        imagePaths,
        notes,
        isCompleted: true
      })
    }
  }

  // const handleDeleteIntake = () => {
  //   // Implementation for delete functionality
  //   toast({
  //     title: "Info",
  //     description: "Delete functionality will be implemented soon",
  //   })
  // }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...newFiles])
      
      // Create object URLs for the files to display them
      const newPaths = newFiles.map(file => {
        return URL.createObjectURL(file)
      })
      
      setImagePaths(prev => [...prev, ...newPaths])
      
      // Reset input value so the same file can be selected again if needed
      e.target.value = ''
    }
  }

  const removeImagePath = (index: number) => {
    // Release the object URL to avoid memory leaks
    if (imageFiles[index] && imagePaths[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePaths[index])
    }
    
    const updatedPaths = [...imagePaths]
    updatedPaths.splice(index, 1)
    setImagePaths(updatedPaths)
    
    const updatedFiles = [...imageFiles]
    updatedFiles.splice(index, 1)
    setImageFiles(updatedFiles)
  }

  if (visitLoading || intakeLoading) {
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
          <h2 className="text-lg font-semibold">Intake Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Weight (kg)
            </label>
            <Input
              id="weightKg"
              type="number"
              step="0.01"
              value={weightKg || ""}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full max-w-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photos
            </label>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={triggerFileInput}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              
              {imagePaths.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {imagePaths.map((path, index) => (
                    <div key={index} className="relative border rounded p-2 h-24 w-24">
                      {path.startsWith('blob:') ? (
                        <img 
                          src={path} 
                          alt={`Patient photo ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Image className="h-8 w-8 opacity-50" />
                          <span className="text-xs mt-1">{path.split('/').pop()}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white p-0"
                        onClick={() => removeImagePath(index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No photos uploaded</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32"
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              className="theme-button text-white"
              onClick={handleSaveIntake}
              disabled={weightKg === undefined || createIntakeMutation.isPending || updateIntakeMutation.isPending}
            >
              {createIntakeMutation.isPending || updateIntakeMutation.isPending 
                ? "Saving..." 
                : hasIntake ? "Update" : "Save & Next"}
            </Button>
            
            
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 