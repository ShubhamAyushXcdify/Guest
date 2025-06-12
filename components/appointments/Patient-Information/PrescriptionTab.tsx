"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, X, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { useGetProducts } from "@/queries/products/get-products"
import { useCreatePrescriptionDetail } from "@/queries/PrescriptionDetail/create-prescription-detail"
import { useGetPrescriptionDetailByVisitId } from "@/queries/PrescriptionDetail/get-prescription-detail-by-visit-id"
import { useUpdatePrescriptionDetail } from "@/queries/PrescriptionDetail/update-prescription-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface PrescriptionTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

interface ProductMapping {
  id?: string
  productId: string
  dosage: string
  frequency: string
}

export default function PrescriptionTab({ patientId, appointmentId, onNext }: PrescriptionTabProps) {
  const [notes, setNotes] = useState("")
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentMapping, setCurrentMapping] = useState<ProductMapping>({ productId: "", dosage: "", frequency: "" })
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get all products
  const { data: productsData, isLoading: productsLoading } = useGetProducts(1, 100, '', true)
  
  // Get existing prescription detail
  const { data: existingPrescriptionDetail, refetch: refetchPrescriptionDetail } = 
    useGetPrescriptionDetailByVisitId(visitData?.id || "")
  
  // Initialize from existing data
  useEffect(() => {
    if (existingPrescriptionDetail) {
      if (existingPrescriptionDetail.notes) {
        setNotes(existingPrescriptionDetail.notes)
      }
      
      if (existingPrescriptionDetail.productMappings?.length) {
        setProductMappings(existingPrescriptionDetail.productMappings.map(pm => ({
          id: pm.id,
          productId: pm.productId,
          dosage: pm.dosage,
          frequency: pm.frequency
        })))
      }
    }
  }, [existingPrescriptionDetail])
  
  const createPrescriptionDetailMutation = useCreatePrescriptionDetail({
    onSuccess: () => {
      toast.success("Prescription details saved successfully")
      refetchPrescriptionDetail()
      if (onNext) onNext()
    },
    onError: (error) => {
      toast.error(`Failed to save prescription details: ${error.message}`)
    }
  })

  const updatePrescriptionDetailMutation = useUpdatePrescriptionDetail({
    onSuccess: () => {
      toast.success("Prescription details updated successfully")
      refetchPrescriptionDetail()
      if (onNext) onNext()
    },
    onError: (error: any) => {
      toast.error(`Failed to update prescription details: ${error.message}`)
    }
  })

  const openAddDialog = () => {
    setCurrentMapping({ productId: "", dosage: "", frequency: "" })
    setEditingIndex(null)
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (index: number) => {
    setCurrentMapping({ ...productMappings[index] })
    setEditingIndex(index)
    setIsAddDialogOpen(true)
  }

  const handleRemoveProduct = (index: number) => {
    const updatedMappings = [...productMappings]
    updatedMappings.splice(index, 1)
    setProductMappings(updatedMappings)
  }

  const handleSaveMapping = () => {
    if (!currentMapping.productId || !currentMapping.dosage || !currentMapping.frequency) {
      toast.error("Please fill in all fields")
      return
    }

    if (editingIndex !== null) {
      // Update existing mapping
      const updatedMappings = [...productMappings]
      updatedMappings[editingIndex] = currentMapping
      setProductMappings(updatedMappings)
    } else {
      // Add new mapping
      setProductMappings([...productMappings, currentMapping])
    }

    setIsAddDialogOpen(false)
  }

  const handleSave = () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    
    // Filter out incomplete product mappings
    const validMappings = productMappings.filter(
      pm => pm.productId && pm.dosage && pm.frequency
    )
    
    if (validMappings.length === 0) {
      toast.error("Please add at least one product with dosage and frequency")
      return
    }
    
    if (existingPrescriptionDetail) {
      // Update existing prescription detail
      updatePrescriptionDetailMutation.mutate({
        id: existingPrescriptionDetail.id,
        notes,
        productMappings: validMappings.map(({ id, ...rest }) => rest),
        visitId: visitData.id
      })
    } else {
      // Create new prescription detail
      createPrescriptionDetailMutation.mutate({
        visitId: visitData.id,
        notes,
        productMappings: validMappings.map(({ id, ...rest }) => rest)
      })
    }
  }

  if (visitLoading || productsLoading) {
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

  const products = productsData?.items || []
  
  // Function to get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : "Unknown Product"
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Prescription</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={openAddDialog}
          >
            <PlusCircle className="h-4 w-4" /> 
            Add Medicine
          </Button>
        </div>

        {productMappings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No medicines added yet. Click "Add Medicine" to start creating a prescription.
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productMappings.map((mapping, index) => (
                  <TableRow key={index}>
                    <TableCell>{getProductName(mapping.productId)}</TableCell>
                    <TableCell>{mapping.dosage}</TableCell>
                    <TableCell>{mapping.frequency}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(index)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-6">
          <Label htmlFor="notes">Additional Notes</Label>
          <textarea
            id="notes"
            className="w-full border rounded-md p-2 min-h-[100px] mt-2"
            placeholder="Add any additional details about the prescription..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={
              createPrescriptionDetailMutation.isPending || 
              updatePrescriptionDetailMutation.isPending ||
              productMappings.length === 0
            }
          >
            {createPrescriptionDetailMutation.isPending || updatePrescriptionDetailMutation.isPending 
              ? "Saving..." 
              : existingPrescriptionDetail ? "Update" : "Save & Next"}
          </Button>
        </div>
      </CardContent>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Edit Product" : "Add Medicine"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Medicine</Label>
              <Select
                value={currentMapping.productId}
                onValueChange={(value) => setCurrentMapping({...currentMapping, productId: value})}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a medicine" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg"
                value={currentMapping.dosage}
                onChange={(e) => setCurrentMapping({...currentMapping, dosage: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="e.g., Twice daily"
                value={currentMapping.frequency}
                onChange={(e) => setCurrentMapping({...currentMapping, frequency: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMapping}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}