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
import { Plus, Trash, Upload, Image, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useTabCompletion } from "@/context/TabCompletionContext"

interface IntakeTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function IntakeTab({ patientId, appointmentId, onNext }: IntakeTabProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { markTabAsCompleted, isTabCompleted } = useTabCompletion()
  
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
  
  // Image viewer modal state
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imageRotation, setImageRotation] = useState(0)
  
  // Use mutateAsync pattern for better control flow
  const { mutateAsync: createIntakeDetail, isPending: isCreating } = useCreateIntakeDetail({})
  const { mutateAsync: updateIntakeDetail, isPending: isUpdating } = useUpdateIntakeDetail({})
  
  // Combined loading state
  const isPending = isCreating || isUpdating

  // Initialize form with existing data when available
  useEffect(() => {
    if (intakeData) {
      setWeightKg(intakeData.weightKg);
      
      // Get API base URL from environment variable
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiBaseUrl) {
        console.warn('NEXT_PUBLIC_API_URL environment variable is not defined');
      }
      
      // Process both images and files arrays from the API response
      let paths: string[] = [];
      
      // Process images array if it exists
      if (intakeData.images && intakeData.images.length > 0) {
        const imagePaths = intakeData.images.map(img => {
          // Check if the path is already a full URL or a blob URL
          if (img.imagePath.startsWith('http://') || 
              img.imagePath.startsWith('https://') || 
              img.imagePath.startsWith('blob:')) {
            return img.imagePath;
          }
          
          // If we have filePath instead of imagePath
          if (img.filePath) {
            // Format: "Uploads\\file.jpg" - we need to convert backslashes and prepend API URL
            const formattedPath = img.filePath.replace(/\\/g, '/');
            return apiBaseUrl ? `${apiBaseUrl}/${formattedPath}` : formattedPath;
          }
          
          // If it's a relative path, prepend the API URL
          return apiBaseUrl ? `${apiBaseUrl}/${img.imagePath}` : img.imagePath;
        });
        paths = [...paths, ...imagePaths];
      }
      
      // Process files array if it exists (from the screenshot, this is where the images are)
      if (intakeData.files && intakeData.files.length > 0) {
        const filePaths = intakeData.files.map(file => {
          // Format: "Uploads\\file.jpg" - we need to convert backslashes and prepend API URL
          const formattedPath = file.filePath.replace(/\\/g, '/');
          return apiBaseUrl ? `${apiBaseUrl}/${formattedPath}` : formattedPath;
        });
        paths = [...paths, ...filePaths];
      }
      
      setImagePaths(paths);
      setNotes(intakeData.notes || "");
      setHasIntake(true);
      
      // If intake is marked as completed, update the tab completion status
      if (intakeData.isCompleted) {
        markTabAsCompleted("intake");
      }
    }
  }, [intakeData, markTabAsCompleted]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any blob URLs to prevent memory leaks
      imagePaths.forEach(path => {
        if (path.startsWith('blob:')) {
          URL.revokeObjectURL(path);
        }
      });
    };
  }, []);

  const handleSaveIntake = async () => {
    if (!visitData?.id) {
      toast({
        title: "Error",
        description: "No visit data found for this appointment",
        variant: "destructive",
      })
      return
    }
    
    try {
      if (hasIntake && intakeData?.id) {
        // Update existing intake, ensuring ID is included
        await updateIntakeDetail({
          id: intakeData.id,
          visitId: intakeData.visitId || visitData?.id,
          weightKg: weightKg!,
          imagePaths,
          files: imageFiles,
          notes,
          isCompleted: true
        })
        
        toast({
          title: "Success",
          description: "Intake detail updated successfully",
        })
      } else {
        // Create new intake
        await createIntakeDetail({
          visitId: visitData.id,
          weightKg: weightKg!,
          imagePaths,
          files: imageFiles,
          notes,
          isCompleted: true
        })
        
        toast({
          title: "Success",
          description: "Intake detail saved successfully",
        })
        setHasIntake(true);
      }
      
      // Mark tab as completed
      markTabAsCompleted("intake");
      
      // Refetch intake data and navigate to next tab
      refetchIntake();
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Error saving intake details:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save intake detail",
        variant: "destructive",
      })
    }
  }

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
  
  // Function to open image viewer
  const openImageViewer = (imagePath: string) => {
    setSelectedImage(imagePath);
    setImageZoom(1);  // Reset zoom level
    setImageRotation(0);  // Reset rotation
  }
  
  // Function to close image viewer
  const closeImageViewer = () => {
    setSelectedImage(null);
  }
  
  // Function to zoom in
  const zoomIn = () => {
    setImageZoom(prev => Math.min(3, prev + 0.2));
  }
  
  // Function to zoom out
  const zoomOut = () => {
    setImageZoom(prev => Math.max(0.5, prev - 0.2));
  }
  
  // Function to rotate image
  const rotateImage = () => {
    setImageRotation(prev => (prev + 90) % 360);
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
    <>
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
                        {path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://') ? (
                          <img 
                            src={path} 
                            alt={`Patient photo ${index + 1}`}
                            className="h-full w-full object-cover cursor-pointer"
                            onClick={() => openImageViewer(path)}
                          />
                        ) : (
                          <div 
                            className="flex items-center justify-center h-full w-full cursor-pointer" 
                            onClick={() => openImageViewer(path)}
                          >
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

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSaveIntake}
                disabled={weightKg === undefined || isPending}
                className="ml-2"
              >
                {isPending 
                  ? "Saving..." 
                  : hasIntake ? "Update" : "Save and Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Image Viewer Modal */}
      <Dialog open={!!selectedImage} onOpenChange={open => !open && closeImageViewer()}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Image Viewer</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={rotateImage}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto w-full h-full flex items-center justify-center p-2">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Patient photo"
                className="max-w-full max-h-full object-contain transition-transform duration-200 ease-in-out"
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 