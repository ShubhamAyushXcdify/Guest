"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X, Trash2, Pencil, Mic, Search } from "lucide-react"
import { toast } from "sonner"
import { useCreatePrescriptionDetail } from "@/queries/PrescriptionDetail/create-prescription-detail"
import { useGetPrescriptionDetailByVisitId } from "@/queries/PrescriptionDetail/get-prescription-detail-by-visit-id"
import { useUpdatePrescriptionDetail } from "@/queries/PrescriptionDetail/update-prescription-detail"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { useTabCompletion } from "@/context/TabCompletionContext"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { useGetInventorySearchByClinicId, InventorySearchItem } from "@/queries/inventory/get-inventory-search-by-clinicId"
import { ProductMapping as BaseProductMapping } from "@/queries/PrescriptionDetail/get-prescription-detail-by-id"

interface PrescriptionTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

// Extend the base ProductMapping to include our additional properties
interface ExtendedProductMapping extends BaseProductMapping {
  productName?: string
  product?: {
    id: string
    name: string
    genericName?: string
    productNumber?: string
    [key: string]: any
  }
}

export default function PrescriptionTab({ patientId, appointmentId, onNext }: PrescriptionTabProps) {
  const [notes, setNotes] = useState("")
  const [productMappings, setProductMappings] = useState<ExtendedProductMapping[]>([])
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentMapping, setCurrentMapping] = useState<ExtendedProductMapping>({ 
    id: "",
    productId: "", 
    dosage: "", 
    frequency: "",
    productName: undefined,
    product: undefined
  })
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const { markTabAsCompleted } = useTabCompletion()
  
  // Medicine search state
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<{ id: string, name: string } | null>(null)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(medicineSearchQuery)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [medicineSearchQuery])
  
  const transcriber = useTranscriber()
  
  // Get visit data from appointment ID
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId)
  
  // Get appointment data to get clinic ID
  const { data: appointmentData } = useGetAppointmentById(appointmentId)
  const clinicId = appointmentData?.clinicId || ""

  // Search for medicines by clinic ID
  const { data: searchResults, isLoading: isSearching } = useGetInventorySearchByClinicId(
    clinicId,
    debouncedSearchQuery,
    10,
    Boolean(clinicId) && Boolean(debouncedSearchQuery) && debouncedSearchQuery.length >= 2
  )

  // Get existing prescription detail
  const { data: existingPrescriptionDetail, refetch: refetchPrescriptionDetail } = 
    useGetPrescriptionDetailByVisitId(visitData?.id || "")
  
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
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
          productName: (pm as any).productName,
          dosage: pm.dosage,
          frequency: pm.frequency,
          product: (pm as any).product
        } as ExtendedProductMapping)))
      }
      
      // Mark tab as completed if it was already completed or if it has products
      if (existingPrescriptionDetail.productMappings && 
           existingPrescriptionDetail.productMappings.length > 0) {
        markTabAsCompleted("assessment")
      }
    }
  }, [existingPrescriptionDetail, markTabAsCompleted])
  
  // Handle transcription output
  useEffect(() => {
    const output = transcriber.output
    if (output && !output.isBusy && output.text) {
      setNotes(prev => prev ? prev + "\n" + output.text : output.text)
    }
    // eslint-disable-next-line
  }, [transcriber.output?.isBusy])
  
  const createPrescriptionDetailMutation = useCreatePrescriptionDetail({
    onSuccess: () => {
      toast.success("Prescription details saved successfully")
      markTabAsCompleted("assessment")
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
      markTabAsCompleted("assessment")
      refetchPrescriptionDetail()
      if (onNext) onNext()
    },
    onError: (error: any) => {
      toast.error(`Failed to update prescription details: ${error.message}`)
    }
  })

  const openAddSheet = () => {
    setCurrentMapping({ 
      id: "",
      productId: "", 
      dosage: "", 
      frequency: "",
      productName: undefined,
      product: undefined
    } as ExtendedProductMapping)
    setEditingIndex(null)
    setSelectedMedicine(null)
    setMedicineSearchQuery("")
    setIsAddSheetOpen(true)
  }

  const openEditSheet = (index: number) => {
    const mapping = productMappings[index]
    setCurrentMapping({ ...mapping })
    setEditingIndex(index)
    
    const extendedMapping = mapping as ExtendedProductMapping;
    
    // Find the product name for the selected medicine
    const product = searchResults?.items?.find(item => 
      item.productId === mapping.productId || item.id === mapping.productId
    )
    
    if (product) {
      setSelectedMedicine({
        id: mapping.productId,
        name: product.product?.name || extendedMapping.productName || "Unknown Medicine"
      })
    } else {
      // If product not in current search results, use the stored name if available
      setSelectedMedicine({
        id: mapping.productId,
        name: extendedMapping.productName || extendedMapping.product?.name || "Medicine"
      })
    }
    
    setIsAddSheetOpen(true)
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

    setIsAddSheetOpen(false)
    setSelectedMedicine(null)
    setMedicineSearchQuery("")
  }

  const handleMedicineSelect = (medicine: InventorySearchItem) => {
    setSelectedMedicine({
      id: medicine.productId || medicine.id,
      name: medicine.product?.name || "Unknown Medicine"
    })
    
    const mappingWithProduct: ExtendedProductMapping = {
      id: "",
      productId: medicine.productId || medicine.id,
      dosage: currentMapping.dosage,
      frequency: currentMapping.frequency,
      productName: medicine.product?.name || "Unknown Medicine",
      product: medicine.product
    };
    
    setCurrentMapping(mappingWithProduct);
    setMedicineSearchQuery("")
    setIsSearchDropdownOpen(false)
  }

  const clearSelectedMedicine = () => {
    setSelectedMedicine(null)
    const clearedMapping: ExtendedProductMapping = {
      ...currentMapping,
      productId: "",
      productName: undefined,
      product: undefined
    };
    setCurrentMapping(clearedMapping);
  }

  const handleSave = async () => {
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
    
    // Ensure each mapping has a productName before sending to backend
    const mappingsWithNames = validMappings.map(mapping => {
      const updatedMapping = { ...mapping } as ExtendedProductMapping;
      
      if (!updatedMapping.productName) {
        // Try to find the medicine name from search results
        const product = searchResults?.items?.find(item => 
          item.productId === mapping.productId || item.id === mapping.productId
        )
        
        if (product && product.product?.name) {
          updatedMapping.productName = product.product.name;
          updatedMapping.product = product.product;
        }
      }
      return updatedMapping;
    })
    
    // Create a backend-compatible version of the data by removing our extended properties
    const backendMappings = mappingsWithNames.map(({ id, productId, dosage, frequency }) => ({
      id, productId, dosage, frequency
    }));
    
    const prescriptionData = {
      notes,
      isCompleted: true,
      productMappings: backendMappings
    }
    
    if (existingPrescriptionDetail) {
      // Update existing prescription detail
      await updatePrescriptionDetailMutation.mutateAsync({
        id: existingPrescriptionDetail.id,
        ...prescriptionData,
        visitId: visitData.id
      })
    } else {
      // Create new prescription detail
      await createPrescriptionDetailMutation.mutateAsync({
        visitId: visitData.id,
        ...prescriptionData
      })
    }
  }

  const isReadOnly = appointmentData?.status === "completed"

  if (visitLoading) {
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
  
  // Function to get product name by ID
  const getProductName = (productId: string) => {
    // First check the existing mappings
    const mapping = productMappings.find(m => m.productId === productId)
    if (!mapping) return "Unknown Product"
    
    // First option: Check if mapping has a product object with name
    const extendedMapping = mapping as ExtendedProductMapping;
    if (extendedMapping.product?.name) return extendedMapping.product.name
    
    // Second option: Use the stored product name if available
    if (extendedMapping.productName) return extendedMapping.productName
    
    // Third option: Try to find name from search results
    if (searchResults?.items) {
      const foundProduct = searchResults.items.find(item => 
        item.productId === productId || item.id === productId
      )
      if (foundProduct?.product?.name) {
        return foundProduct.product.name
      }
    }
    
    // If no name is found, return a simple "Medicine" label
    return "Medicine"
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
            onClick={openAddSheet}
            disabled={isReadOnly}
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
                          onClick={() => openEditSheet(index)}
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          disabled={isReadOnly}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(index)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={isReadOnly}
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
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="notes">Additional Notes</Label>
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
            id="notes"
            className="w-full border rounded-md p-2 min-h-[100px] mt-2"
            placeholder="Add any additional details about the prescription..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={
              createPrescriptionDetailMutation.isPending || 
              updatePrescriptionDetailMutation.isPending ||
              productMappings.length === 0 ||
              isReadOnly
            }
          >
            {createPrescriptionDetailMutation.isPending || updatePrescriptionDetailMutation.isPending 
              ? "Saving..." 
              : existingPrescriptionDetail ? "Update" : "Save & Next"}
          </Button>
        </div>
      </CardContent>

      {/* Add/Edit Product Side Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingIndex !== null ? "Edit Medicine" : "Add Medicine"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="product">Medicine</Label>
              <div className="relative flex-grow" ref={searchDropdownRef}>
                {selectedMedicine ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span>{selectedMedicine.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 h-auto"
                      onClick={clearSelectedMedicine}
                      disabled={isReadOnly}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search medicines by name or code..."
                        value={medicineSearchQuery}
                        onChange={(e) => {
                          setMedicineSearchQuery(e.target.value)
                          if (e.target.value.length >= 2) {
                            setIsSearchDropdownOpen(true)
                          } else {
                            setIsSearchDropdownOpen(false)
                          }
                        }}
                        className="pl-9"
                        disabled={isReadOnly}
                      />
                    </div>
                    
                    {isSearchDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {isSearching && (
                          <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
                        )}
                        
                        {!isSearching && (!searchResults || !searchResults.items || searchResults.items.length === 0) && (
                          <div className="px-4 py-2 text-sm text-gray-500">No medicines found</div>
                        )}
                        
                        {!isSearching && searchResults && searchResults.items && searchResults.items.length > 0 && (
                          <ul className="py-1">
                            {searchResults.items.map((item) => (
                              <li
                                key={item.id}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => handleMedicineSelect(item)}
                              >
                                <div className="font-medium">{item.product?.name || "Unknown Product"}</div>
                                {item.product?.productNumber && (
                                  <div className="text-sm text-gray-500">
                                    Code: {item.product.productNumber}
                                  </div>
                                )}
                                {item.product?.genericName && (
                                  <div className="text-sm text-gray-500">
                                    Generic: {item.product.genericName}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg"
                value={currentMapping.dosage}
                onChange={(e) => isReadOnly ? undefined : setCurrentMapping({...currentMapping, dosage: e.target.value})}
                disabled={isReadOnly}
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="e.g., Twice daily"
                value={currentMapping.frequency}
                onChange={(e) => isReadOnly ? undefined : setCurrentMapping({...currentMapping, frequency: e.target.value})}
                disabled={isReadOnly}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {[
                  "1-0-1",
                  "1-0-0",
                  "0-0-1",
                  "1-1-1",
                  "0.5-0-0.5",
                  "0.5-0-0",
                  "0-0-0.5",
                  "0.5-0.5-0.5"
                ].map(value => (
                  <button
                    key={value}
                    type="button"
                    className={`px-2 py-1 rounded border text-sm ${currentMapping.frequency === value ? "bg-blue-100 border-blue-400" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => !isReadOnly && setCurrentMapping({...currentMapping, frequency: value})}
                    disabled={isReadOnly}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAddSheetOpen(false)} disabled={isReadOnly}>Cancel</Button>
            <Button onClick={handleSaveMapping} disabled={isReadOnly}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <AudioManager
        open={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        transcriber={transcriber}
        onTranscriptionComplete={(transcript: string) => {
          setNotes(prev => prev ? prev + "\n" + transcript : transcript)
          setAudioModalOpen(false)
        }}
      />
    </Card>
  )
}