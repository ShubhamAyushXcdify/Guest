"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, X, Trash2, Pencil, Search, Printer, AlertTriangle } from "lucide-react"
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
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useGetPrescriptionPdf } from "@/queries/PrescriptionDetail/get-prescription-pdf"
import { useGetProducts } from "@/queries/products/get-products"
import type { Product as ComponentProduct } from "@/components/products"
import { ProductMapping as BaseProductMapping } from "@/queries/PrescriptionDetail/get-prescription-detail-by-id"
import { useGetComplaintByVisitId } from "@/queries/complaint/get-complaint-by-visit-id"
import { useGetBatchByProductName, type BatchDataItem } from "@/queries/purchaseOrderRecevingHiistory/get-batch-by-product-name";


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
    category?: string
    productType?: string
    manufacturer?: string
    ndcNumber?: string
    strength?: string
    dosageForm?: string
    unitOfMeasure?: string
    requiresPrescription?: boolean
    controlledSubstanceSchedule?: string
    brandName?: string
    storageRequirements?: string
    isActive?: boolean
    price?: number
    [key: string]: any
  }
  quantity?: number
  quantityAvailable?: number
  batchNo?: string
  expDate?: string
  checked?: boolean
  isChecked?: boolean
  directions?: string
  purchaseOrderReceivingHistoryId?: string
  purchaseOrderReceivingHistory?: {
    id: string
    purchaseOrderId: string
    purchaseOrderItemId: string
    productId: string
    clinicId: string
    quantityReceived: number
    batchNumber: string
    expiryDate: string
    dateOfManufacture: string
    receivedDate: string
    receivedBy: string
    notes: string
    unitCost: number
    lotNumber?: string
    supplierId: string
    createdAt: string
    updatedAt: string
    productName?: string
    clinicName?: string
    supplierName?: string
    receivedByName?: string
    orderNumber?: string
    quantityInHand: number
    barcode: string
    shelf?: string
    bin?: string
    productDetails?: any
    supplierDetails?: any
  }
}

export default function PrescriptionTab({ patientId, appointmentId, onNext }: PrescriptionTabProps) {

  const [productMappings, setProductMappings] = useState<ExtendedProductMapping[]>([])
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentMapping, setCurrentMapping] = useState<ExtendedProductMapping>({
    id: "",
    productId: "",
    dosage: "",
    frequency: "",
    numberOfDays: 0,
    directions: "",
    productName: undefined,
    product: undefined
  })
  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const { markTabAsCompleted } = useTabCompletion()

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ index: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Track original values for edit form change detection
  const [originalEditValues, setOriginalEditValues] = useState<ExtendedProductMapping | null>(null)


  
  // Medicine search state
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<{ id: string, name: string } | null>(null)
  const [selectedMedicineDetails, setSelectedMedicineDetails] = useState<any>(null)
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
  // Get complaint symptoms for this visit
  const { data: complaintData } = useGetComplaintByVisitId(visitData?.id || "", !!visitData?.id)
  
  // Get appointment data to get clinic ID
  const { data: appointmentData } = useGetAppointmentById(appointmentId)
  const clinicId = appointmentData?.clinicId || ""

  // Get prescription PDF data (disabled by default to prevent auto-opening)
  const { data: prescriptionPdfData, refetch: refetchPrescriptionPdf } = useGetPrescriptionPdf(
    visitData?.id || "",
    false // Disable automatic fetching to prevent auto-opening of PDF
  )

  // Search for medicines by product name using batch data
  const { data: searchResults, isLoading: isSearching } = useGetBatchByProductName(
    debouncedSearchQuery,
    clinicId
  );

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
      
      if (existingPrescriptionDetail.productMappings?.length) {
        setProductMappings(existingPrescriptionDetail.productMappings.map(pm => {
          const extendedPm = pm as any;
          return {
            id: extendedPm.id,
            productId: extendedPm.productId,
            productName: extendedPm.product?.name || extendedPm.productName,
            dosage: extendedPm.dosage,
            frequency: extendedPm.frequency,
            numberOfDays: extendedPm.numberOfDays,
            directions: extendedPm.directions || "",
            product: extendedPm.product,
            quantity: extendedPm.quantity,
            quantityAvailable: extendedPm.purchaseOrderReceivingHistory?.quantityInHand || extendedPm.quantityAvailable,
            batchNo: extendedPm.purchaseOrderReceivingHistory?.batchNumber || extendedPm.batchNo,
            expDate: extendedPm.purchaseOrderReceivingHistory?.expiryDate || extendedPm.expDate,
            checked: extendedPm.isChecked || extendedPm.checked,
            isChecked: extendedPm.isChecked,
            purchaseOrderReceivingHistoryId: extendedPm.purchaseOrderReceivingHistoryId,
            purchaseOrderReceivingHistory: extendedPm.purchaseOrderReceivingHistory
          } as ExtendedProductMapping;
        }))
      }



      // Mark tab as completed if it was already completed or if it has products
      if (existingPrescriptionDetail.productMappings &&
           existingPrescriptionDetail.productMappings.length > 0) {
        markTabAsCompleted("assessment")
      }
    }
  }, [existingPrescriptionDetail, markTabAsCompleted])
  
  // Handle transcription output

  
  const createPrescriptionDetailMutation = useCreatePrescriptionDetail({
    onSuccess: () => {
      toast.success("Prescription details saved successfully")
      markTabAsCompleted("assessment")
      refetchPrescriptionDetail()
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
    },
    onError: (error: any) => {
      toast.error(`Failed to update prescription details: ${error.message}`)
    }
  })

  // Auto-calculate quantity when currentMapping frequency or numberOfDays changes
  useEffect(() => {
    if (currentMapping.frequency && currentMapping.numberOfDays) {
      const calculatedQuantity = calculateQuantity(currentMapping.frequency, currentMapping.numberOfDays);
      const availableQuantity = currentMapping.quantityAvailable || 0;

      // Cap the calculated quantity to available stock
      const finalQuantity = availableQuantity > 0 ? Math.min(calculatedQuantity, availableQuantity) : calculatedQuantity;

      if (finalQuantity !== currentMapping.quantity) {
        setCurrentMapping(prev => ({
          ...prev,
          quantity: finalQuantity
        }));
      }
    }
  }, [currentMapping.frequency, currentMapping.numberOfDays, currentMapping.quantityAvailable]);

  const openAddSheet = () => {
    setCurrentMapping({
      id: "",
      productId: "",
      dosage: "",
      frequency: "",
      numberOfDays: 0,
      directions: "",
      productName: undefined,
      product: undefined,
      quantity: undefined,
      quantityAvailable: 0,
      batchNo: undefined,
      expDate: undefined,
      checked: undefined,
      purchaseOrderReceivingHistoryId: undefined
    } as ExtendedProductMapping)
    setEditingIndex(null)
    setSelectedMedicine(null)
    setSelectedMedicineDetails(null)
    setMedicineSearchQuery("")
    setOriginalEditValues(null)
    setIsAddSheetOpen(true)
  }

  const openEditSheet = (index: number) => {
    const mapping = productMappings[index]
    // Ensure quantity is calculated when editing
    const calculatedQuantity = calculateQuantity(mapping.frequency || "", mapping.numberOfDays || 0)
    const mappingWithQuantity = { ...mapping, quantity: calculatedQuantity }
    setCurrentMapping(mappingWithQuantity)
    setEditingIndex(index)

    // Store original values for change detection
    setOriginalEditValues(mappingWithQuantity)
    
    const extendedMapping = mapping as ExtendedProductMapping;
    
    // Set the selected medicine using stored data
    setSelectedMedicine({
      id: mapping.productId,
      name: extendedMapping.productName || extendedMapping.product?.name || "Medicine"
    })
    
    // Create a batch item object from stored data for consistency
    const storedBatchItem = {
      id: extendedMapping.purchaseOrderReceivingHistoryId || "",
      productId: mapping.productId,
      productName: extendedMapping.productName || extendedMapping.product?.name || "Medicine",
      quantityInHand: extendedMapping.quantityAvailable || 0,
      batchNumber: extendedMapping.batchNo || "",
      expiryDate: extendedMapping.expDate || "",
      dateOfManufacture: extendedMapping.purchaseOrderReceivingHistory?.dateOfManufacture || "",
      productDetails: extendedMapping.product || extendedMapping.purchaseOrderReceivingHistory?.productDetails || null
    }
    
    setSelectedMedicineDetails(storedBatchItem)
    
    setIsAddSheetOpen(true)
  }

  const openDeleteDialog = (index: number) => {
    const mapping = productMappings[index]
    const productName = getProductName(mapping.productId)
    setProductToDelete({ index, name: productName })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete || !visitData?.id || !existingPrescriptionDetail) return

    setIsDeleting(true)
    try {
      const updatedMappings = [...productMappings]
      updatedMappings.splice(productToDelete.index, 1)

      // Format product mappings for API
      const formattedMappings = updatedMappings.map(mapping => ({
        productId: mapping.productId,
        isChecked: mapping.isChecked ?? mapping.checked ?? false,
        quantity: mapping.quantity ?? 0,
        frequency: mapping.frequency,
        directions: mapping.directions || "",
        numberOfDays: mapping.numberOfDays || 0,
        purchaseOrderReceivingHistoryId: mapping.purchaseOrderReceivingHistoryId || ""
      }))

      // PUT call to update prescription without the deleted medicine
      const updatePayload = {
        id: existingPrescriptionDetail.id,
        notes: "",
        visitId: visitData.id,
        productMappings: formattedMappings
      }

      await updatePrescriptionDetailMutation.mutateAsync(updatePayload)

      // Update local state only after successful API call
      setProductMappings(updatedMappings)
      toast.success("Medicine removed successfully")
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error("Failed to remove medicine")
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  const handleRemoveProduct = (index: number) => {
    openDeleteDialog(index)
  }

  const handleSaveMapping = async () => {
    const unitOfMeasure = currentMapping.product?.unitOfMeasure || "EA"
    const shouldShowDosage = unitOfMeasure === "BOTTLE"

    // Validate required fields based on unit of measure
    if (!currentMapping.productId || !currentMapping.frequency || !currentMapping.numberOfDays || currentMapping.numberOfDays <= 0) {
      toast.error("Please fill in all required fields including number of days")
      return
    }

    // Only validate dosage if the product is a bottle
    if (shouldShowDosage && !currentMapping.dosage) {
      toast.error("Please fill in all fields")
      return
    }

    // Validate that quantity doesn't exceed available stock
    if (hasInsufficientStock()) {
      const calculatedQuantity = calculateQuantity(currentMapping.frequency, currentMapping.numberOfDays);
      const availableQuantity = currentMapping.quantityAvailable || 0;
      const maxDays = calculateMaxDays(currentMapping.frequency, availableQuantity);
      toast.error(
        `Cannot save: Insufficient stock! Required: ${calculatedQuantity} ${unitOfMeasure}, ` +
        `Available: ${availableQuantity} ${unitOfMeasure}. ` +
        `Maximum ${maxDays} days possible with frequency "${currentMapping.frequency}".`
      );
      return;
    }

    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }

    let updatedMappings: ExtendedProductMapping[]

    if (editingIndex !== null) {
      // Update existing mapping
      updatedMappings = [...productMappings]
      updatedMappings[editingIndex] = currentMapping
    } else {
      // Add new mapping with isChecked set to false
      updatedMappings = [...productMappings, { ...currentMapping, isChecked: false }]
    }

    // Format product mappings for API
    const formattedMappings = updatedMappings.map(mapping => ({
      productId: mapping.productId,
      isChecked: mapping.isChecked ?? mapping.checked ?? false,
      quantity: mapping.quantity ?? 0,
      frequency: mapping.frequency,
      directions: mapping.directions || "",
      numberOfDays: mapping.numberOfDays || 0,
      purchaseOrderReceivingHistoryId: mapping.purchaseOrderReceivingHistoryId || ""
    }))

    try {
      if (existingPrescriptionDetail) {
        // PUT call - Update existing prescription detail
        const updatePayload = {
          id: existingPrescriptionDetail.id,
          notes: "",
          visitId: visitData.id,
          productMappings: formattedMappings
        }
        await updatePrescriptionDetailMutation.mutateAsync(updatePayload)
      } else {
        // POST call - Create new prescription detail
        const createPayload = {
          visitId: visitData.id,
          notes: "",
          productMappings: formattedMappings
        }
        await createPrescriptionDetailMutation.mutateAsync(createPayload)
      }

      // Update local state only after successful API call
      setProductMappings(updatedMappings)
      setIsAddSheetOpen(false)
      setSelectedMedicine(null)
      setSelectedMedicineDetails(null)
      setMedicineSearchQuery("")
      setOriginalEditValues(null)

      toast.success(editingIndex !== null ? "Medicine updated successfully" : "Medicine added successfully")
    } catch (error) {
      toast.error("Failed to save medicine")
    }
  }

  const handleMedicineSelect = (batchItem: BatchDataItem) => {
    const medicine = batchItem.productDetails;
    setSelectedMedicine({
      id: medicine.id,
      name: medicine.name || "Unknown Medicine"
    });
    setSelectedMedicineDetails(batchItem);
    // Check if the product unit of measure is EA or BOX, then set dosage to null
    const unitOfMeasure = medicine.unitOfMeasure || "EA";
    const shouldShowDosage = unitOfMeasure === "BOTTLE";
    const mappingWithProduct: ExtendedProductMapping = {
      id: currentMapping.id || "",
      productId: medicine.id,
      dosage: shouldShowDosage ? currentMapping.dosage : "",
      frequency: currentMapping.frequency,
      numberOfDays: currentMapping.numberOfDays,
      directions: currentMapping.directions || "",
      productName: medicine.name || "Unknown Medicine",
      product: medicine as unknown as ComponentProduct,
      quantity: currentMapping.quantity,
      quantityAvailable: batchItem.quantityInHand ?? 0,
      batchNo: batchItem.batchNumber,
      expDate: batchItem.expiryDate,
      checked: currentMapping.checked,
      isChecked: currentMapping.isChecked,
      purchaseOrderReceivingHistoryId: batchItem.id
    };
    setCurrentMapping(mappingWithProduct);
    setMedicineSearchQuery("");
    setIsSearchDropdownOpen(false);
  };

  const clearSelectedMedicine = () => {
    setSelectedMedicine(null)
    setSelectedMedicineDetails(null)
    const clearedMapping: ExtendedProductMapping = {
      ...currentMapping,
      productId: "",
      productName: undefined,
      product: undefined,
      quantity: undefined,
      quantityAvailable: 0,
      batchNo: undefined,
      expDate: undefined,
      checked: undefined,
      purchaseOrderReceivingHistoryId: undefined
    };
    setCurrentMapping(clearedMapping);
  }



  const isReadOnly = appointmentData?.status === "completed"

  // Check if there are changes in edit form
  const hasEditChanges = (): boolean => {
    if (!originalEditValues || editingIndex === null) return false

    return (
      currentMapping.dosage !== originalEditValues.dosage ||
      currentMapping.frequency !== originalEditValues.frequency ||
      currentMapping.numberOfDays !== originalEditValues.numberOfDays ||
      currentMapping.directions !== originalEditValues.directions ||
      currentMapping.productId !== originalEditValues.productId
    )
  }

  // Handle print prescription
  const handlePrintPrescription = useCallback(async () => {
    try {
      if (!visitData?.id) {
        toast.error("No visit data found for this appointment")
        return
      }

      // Refetch the PDF data to ensure we have the latest
      const pdfData = await refetchPrescriptionPdf()

      if (pdfData.data?.pdfBase64) {
        try {
          const blob = await fetch(`data:application/pdf;base64,${pdfData.data.pdfBase64}`).then(res => res.blob());
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          // Clean up the URL after a delay
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
          console.error("Error opening PDF:", error);
          toast.error("Failed to open prescription PDF")
        }
      } else {
        toast.error("No prescription PDF available for this visit")
      }
    } catch (error) {
      console.error("Error printing prescription:", error);
      toast.error("Failed to print prescription")
    }
  }, [visitData?.id, refetchPrescriptionPdf])

  // Function to calculate quantity based on frequency and number of days
  const calculateQuantity = (frequency: string, numberOfDays: number): number => {
    if (!frequency || !numberOfDays || numberOfDays <= 0) return 0;

    // Parse frequency patterns like "1-0-1", "2-0-2", etc.
    const frequencyPattern = frequency.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    if (frequencyPattern) {
      const morning = parseFloat(frequencyPattern[1]) || 0;
      const afternoon = parseFloat(frequencyPattern[2]) || 0;
      const evening = parseFloat(frequencyPattern[3]) || 0;
      const dailyDoses = morning + afternoon + evening;
      return Math.ceil(dailyDoses * numberOfDays);
    }

    // Handle other frequency formats
    const lowerFreq = frequency.toLowerCase();
    let dailyDoses = 1; // Default to once daily

    if (lowerFreq.includes('twice') || lowerFreq.includes('2')) {
      dailyDoses = 2;
    } else if (lowerFreq.includes('thrice') || lowerFreq.includes('three') || lowerFreq.includes('3')) {
      dailyDoses = 3;
    } else if (lowerFreq.includes('four') || lowerFreq.includes('4')) {
      dailyDoses = 4;
    } else if (lowerFreq.includes('once') || lowerFreq.includes('1')) {
      dailyDoses = 1;
    }

    return Math.ceil(dailyDoses * numberOfDays);
  };

  // Function to calculate maximum days possible with available stock
  const calculateMaxDays = (frequency: string, availableQuantity: number): number => {
    if (!frequency || !availableQuantity || availableQuantity <= 0) return 0;

    // Parse frequency patterns like "1-0-1", "2-0-2", etc.
    const frequencyPattern = frequency.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
    if (frequencyPattern) {
      const morning = parseFloat(frequencyPattern[1]) || 0;
      const afternoon = parseFloat(frequencyPattern[2]) || 0;
      const evening = parseFloat(frequencyPattern[3]) || 0;
      const dailyDoses = morning + afternoon + evening;
      return Math.floor(availableQuantity / dailyDoses);
    }

    // Handle other frequency formats
    const lowerFreq = frequency.toLowerCase();
    let dailyDoses = 1; // Default to once daily

    if (lowerFreq.includes('twice') || lowerFreq.includes('2')) {
      dailyDoses = 2;
    } else if (lowerFreq.includes('thrice') || lowerFreq.includes('three') || lowerFreq.includes('3')) {
      dailyDoses = 3;
    } else if (lowerFreq.includes('four') || lowerFreq.includes('4')) {
      dailyDoses = 4;
    } else if (lowerFreq.includes('once') || lowerFreq.includes('1')) {
      dailyDoses = 1;
    }

    return Math.floor(availableQuantity / dailyDoses);
  };

  // Function to check if current mapping has sufficient stock
  const hasInsufficientStock = (): boolean => {
    if (!currentMapping.frequency || !currentMapping.numberOfDays || currentMapping.numberOfDays <= 0 || !currentMapping.quantityAvailable) {
      return false; // No validation needed if required fields are missing
    }

    const calculatedQuantity = calculateQuantity(currentMapping.frequency, currentMapping.numberOfDays);
    const availableQuantity = currentMapping.quantityAvailable || 0;

    return calculatedQuantity > availableQuantity && availableQuantity > 0;
  };

  // Function to get validation error message for insufficient stock
  const getStockValidationMessage = (): string => {
    if (!hasInsufficientStock()) return "";
    
    const calculatedQuantity = calculateQuantity(currentMapping.frequency || "", currentMapping.numberOfDays || 0);
    const availableQuantity = currentMapping.quantityAvailable || 0;
    const maxDays = calculateMaxDays(currentMapping.frequency || "", availableQuantity);
    const unitOfMeasure = currentMapping.product?.unitOfMeasure || "EA";
    
    return `Insufficient stock! Required: ${calculatedQuantity} ${unitOfMeasure}, Available: ${availableQuantity} ${unitOfMeasure}. Maximum ${maxDays} days can be prescribed with this frequency.`;
  };





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
    
    // Third option: Check purchase order receiving history for product name
    if (extendedMapping.purchaseOrderReceivingHistory?.productName) {
      return extendedMapping.purchaseOrderReceivingHistory.productName
    }
    
    // Fourth option: Try to find name from search results
    if (searchResults) {
      const foundProduct = searchResults.find(item => 
        item.productId === productId || item.id === productId
      )
      if (foundProduct?.productName) {
        return foundProduct.productName
      }
    }
    
    // If no name is found, return a simple "Medicine" label
    return "Medicine"
  }

  // Function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return dateString
    }
  }

  return (
    <>
      {/* Show symptoms at the top if available */}
      {complaintData?.symptoms && complaintData.symptoms.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold mb-1">Symptoms:</div>
          <div className="flex flex-wrap gap-2">
            {complaintData.symptoms.map(symptom => (
              <span key={symptom.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {symptom.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Prescription</h2>
            <div className="flex gap-2">
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
                   <TableHead>Dispense</TableHead>
                   <TableHead>Medicine</TableHead>
                   <TableHead>Frequency</TableHead>
                   <TableHead>Days</TableHead>
                   <TableHead>Quantity</TableHead>
                   <TableHead>Directions</TableHead>
                   <TableHead>Expiration Date</TableHead>
                   <TableHead>Price</TableHead>
                   <TableHead className="w-[100px]">Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {productMappings.map((mapping, index) => (
                                     <TableRow key={index}>
                     <TableCell>
                       <input
                         type="checkbox"
                         checked={!!mapping.isChecked}
                         disabled={isReadOnly}
                         onChange={async (e) => {
                           const updated = [...productMappings];
                           updated[index] = { ...mapping, isChecked: e.target.checked, checked: e.target.checked };
                           setProductMappings(updated);

                           // Trigger API update when checkbox is changed
                           if (existingPrescriptionDetail && visitData?.id) {
                             const formattedMappings = updated.map(pm => ({
                               productId: pm.productId,
                               isChecked: pm.isChecked ?? pm.checked ?? false,
                               quantity: pm.quantity ?? 0,
                               frequency: pm.frequency,
                               directions: pm.directions || "",
                               numberOfDays: pm.numberOfDays || 0,
                               purchaseOrderReceivingHistoryId: pm.purchaseOrderReceivingHistoryId || ""
                             }));

                             const updatePayload = {
                               id: existingPrescriptionDetail.id,
                               notes: "",
                               visitId: visitData.id,
                               productMappings: formattedMappings
                             };

                             try {
                               await updatePrescriptionDetailMutation.mutateAsync(updatePayload);
                             } catch (error) {
                               toast.error("Failed to update prescription");
                               // Revert the checkbox state on error
                               const revertedUpdated = [...productMappings];
                               revertedUpdated[index] = { ...mapping, isChecked: !e.target.checked, checked: !e.target.checked };
                               setProductMappings(revertedUpdated);
                             }
                           }
                         }}
                         className="w-5 h-5 cursor-pointer"
                       />
                     </TableCell>
                     <TableCell>{getProductName(mapping.productId)}</TableCell>
                     <TableCell>{mapping.frequency}</TableCell>
                     <TableCell>{mapping.numberOfDays}</TableCell>
                     <TableCell>{mapping.quantity ?? "-"}</TableCell>
                     <TableCell className="max-w-[200px] truncate" title={mapping.directions || "-"}>
                       {mapping.directions || "-"}
                     </TableCell>
                     <TableCell>{formatDate(mapping.expDate ?? mapping.purchaseOrderReceivingHistory?.expiryDate)}</TableCell>
                     <TableCell>{mapping.product?.sellingPrice ?? "-"}</TableCell>
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



        <div className="mt-6 flex justify-end gap-2">
          {productMappings.length > 0 && (
            <Button
              variant="outline"
              onClick={handlePrintPrescription}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Prescription
            </Button>
          )}
          <Button
            onClick={() => {
              if (onNext) {
                onNext()
              }
            }}
            disabled={isReadOnly}
          >
            {createPrescriptionDetailMutation.isPending || updatePrescriptionDetailMutation.isPending
              ? "Saving..."
              : "Next"}
          </Button>
        </div>
      </CardContent>

      {/* Add/Edit Product Side Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
      <SheetContent className="w-[100%] sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingIndex !== null ? "Edit Medicine" : "Add Medicine"}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="product">Medicine</Label>
              <div className="relative flex-grow" ref={searchDropdownRef}>
                {selectedMedicine ? (
                  <>
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
                                         {selectedMedicineDetails && (
                       <div className="mt-2 p-2 border rounded bg-gray-50 text-sm">
                         <div><b>Available:</b> {selectedMedicineDetails.quantityInHand || "-"} {selectedMedicineDetails.productDetails?.unitOfMeasure || "EA"}</div>
                         <div><b>DOM:</b> {selectedMedicineDetails.dateOfManufacture ? new Date(selectedMedicineDetails.dateOfManufacture).toLocaleDateString() : "-"}</div>
                         <div><b>Batch Number:</b> {selectedMedicineDetails.batchNumber || "-"}</div>
                         <div><b>Expiry Date:</b> {selectedMedicineDetails.expiryDate ? new Date(selectedMedicineDetails.expiryDate).toLocaleDateString() : "-"}</div>
                       </div>
                     )}
                  </>
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
                        
                        {!isSearching && (!searchResults || searchResults.length === 0) && (
                          <div className="px-4 py-2 text-sm text-gray-500">No medicines found</div>
                        )}
                        
                        {!isSearching && searchResults && searchResults.length > 0 && (
                          <div className="py-1">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Name</th>
                                  <th className="px-4 py-2 text-left">Generic Name</th>
                                  <th className="px-4 py-2 text-left">Category</th>
                                  <th className="px-4 py-2 text-left">Batch No</th>
                                  <th className="px-4 py-2 text-left">Expiry Date</th>
                                  <th className="px-4 py-2 text-right">Available</th>
                                </tr>
                              </thead>
                              <tbody>
                                {searchResults.map((item: BatchDataItem) => (
                                  <tr
                                    key={item.id}
                                    className="cursor-pointer hover:bg-gray-100 border-t"
                                    onClick={() => handleMedicineSelect(item)}
                                  >
                                    <td className="px-4 py-2">
                                      <div className="font-medium">{item.productName || item.productDetails?.name || "Unknown Product"}</div>
                                      {item.productDetails?.productNumber && (
                                        <div className="text-xs text-gray-500">Code: {item.productDetails.productNumber}</div>
                                      )}
                                      {item.productDetails?.brandName && (
                                        <div className="text-xs text-gray-500">Brand: {item.productDetails.brandName}</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">
                                      {item.productDetails?.genericName || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">
                                      {item.productDetails?.category || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">
                                      {item.batchNumber || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">
                                      {item.expiryDate 
                                        ? new Date(item.expiryDate).toLocaleDateString()
                                        : "-"
                                      }
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <span className={`font-medium ${
                                        (item.quantityInHand || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {item.quantityInHand ?? 0}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-1">
                                        {item.productDetails?.unitOfMeasure || "EA"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {(() => {
              const unitOfMeasure = currentMapping.product?.unitOfMeasure || "EA"
              const shouldShowDosage = unitOfMeasure === "BOTTLE"
              
              if (!shouldShowDosage) return null
              
              return (
                <div className="space-y-3">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 10mg"
                    value={currentMapping.dosage || ""}
                    onChange={(e) => isReadOnly ? undefined : setCurrentMapping({...currentMapping, dosage: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>
              )
            })()}
            
                         <div className="space-y-3">
               <Label htmlFor="frequency">Frequency</Label>
               <Input
                 id="frequency"
                 placeholder="e.g., Twice daily"
                 value={currentMapping.frequency}
                 onChange={(e) => {
                   if (isReadOnly) return;
                   const newFrequency = e.target.value;
                   const calculatedQuantity = calculateQuantity(newFrequency, currentMapping.numberOfDays || 0);
                   const availableQuantity = currentMapping.quantityAvailable || 0;

                   // Cap the quantity to available stock
                   const finalQuantity = availableQuantity > 0 ? Math.min(calculatedQuantity, availableQuantity) : calculatedQuantity;

                   // Show warning if calculated quantity exceeds available stock
                   if (calculatedQuantity > availableQuantity && availableQuantity > 0 && newFrequency && currentMapping.numberOfDays) {
                     const maxDays = calculateMaxDays(newFrequency, availableQuantity);
                     toast.error(
                       `Insufficient stock! Available: ${availableQuantity} ${currentMapping.product?.unitOfMeasure || "EA"}. ` +
                       `With frequency "${newFrequency}", maximum ${maxDays} days can be prescribed. Quantity capped to available stock.`
                     );
                   }

                   setCurrentMapping({
                     ...currentMapping,
                     frequency: newFrequency,
                     quantity: finalQuantity
                   });
                 }}
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
                     onClick={() => {
                       if (isReadOnly) return;
                       const calculatedQuantity = calculateQuantity(value, currentMapping.numberOfDays || 0);
                       const availableQuantity = currentMapping.quantityAvailable || 0;

                       // Cap the quantity to available stock
                       const finalQuantity = availableQuantity > 0 ? Math.min(calculatedQuantity, availableQuantity) : calculatedQuantity;

                       // Show warning if calculated quantity exceeds available stock
                       if (calculatedQuantity > availableQuantity && availableQuantity > 0 && currentMapping.numberOfDays) {
                         const maxDays = calculateMaxDays(value, availableQuantity);
                         toast.error(
                           `Insufficient stock! Available: ${availableQuantity} ${currentMapping.product?.unitOfMeasure || "EA"}. ` +
                           `With frequency "${value}", maximum ${maxDays} days can be prescribed. Quantity capped to available stock.`
                         );
                       }

                       setCurrentMapping({
                         ...currentMapping,
                         frequency: value,
                         quantity: finalQuantity
                       });
                     }}
                     disabled={isReadOnly}
                   >
                     {value}
                   </button>
                 ))}
               </div>
             </div>
             
             <div className="space-y-3">
               <Label htmlFor="numberOfDays">Number of Days</Label>
               <Input
                 id="numberOfDays"
                 type="number"
                 min="0"
                 placeholder="e.g., 7"
                 value={currentMapping.numberOfDays || ""}
                 onChange={(e) => {
                   if (isReadOnly) return;
                   const newNumberOfDays = parseInt(e.target.value) || 0;
                   const calculatedQuantity = calculateQuantity(currentMapping.frequency || "", newNumberOfDays);
                   const availableQuantity = currentMapping.quantityAvailable || 0;

                   // Cap the quantity to available stock
                   const finalQuantity = availableQuantity > 0 ? Math.min(calculatedQuantity, availableQuantity) : calculatedQuantity;

                   // Show warning if calculated quantity exceeds available stock
                   if (calculatedQuantity > availableQuantity && availableQuantity > 0 && currentMapping.frequency) {
                     const maxDays = calculateMaxDays(currentMapping.frequency, availableQuantity);
                     toast.error(
                       `Insufficient stock! Available: ${availableQuantity} ${currentMapping.product?.unitOfMeasure || "EA"}. ` +
                       `With frequency "${currentMapping.frequency}", maximum ${maxDays} days can be prescribed. Quantity capped to available stock.`
                     );
                   }

                   setCurrentMapping({
                     ...currentMapping,
                     numberOfDays: newNumberOfDays,
                     quantity: finalQuantity
                   });
                 }}
                 disabled={isReadOnly}
                 className={hasInsufficientStock() ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
               />
               {hasInsufficientStock() && (
                 <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                   <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                   <div className="text-sm text-red-700">
                     <div className="font-medium">Warning: Insufficient Stock</div>
                     <div className="mt-1">{getStockValidationMessage()}</div>
                   </div>
                 </div>
               )}
             </div>
             <div className="space-y-3">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Auto calculated based on frequency and number of days"
                value={currentMapping.quantity && currentMapping.quantity > 0 ? currentMapping.quantity : ""}
                onChange={(e) => {
                  if (isReadOnly) return;
                  const newQuantity = parseInt(e.target.value) || 0;
                  const availableQuantity = currentMapping.quantityAvailable || 0;

                  // Prevent quantity from exceeding available stock
                  if (newQuantity > availableQuantity && availableQuantity > 0) {
                    toast.error(
                      `Quantity cannot exceed available stock! Available: ${availableQuantity} ${currentMapping.product?.unitOfMeasure || "EA"}`
                    );
                    return;
                  }

                  setCurrentMapping({
                    ...currentMapping,
                    quantity: newQuantity
                  });
                }}
                disabled={isReadOnly}
                className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
              />
              {currentMapping.quantityAvailable !== undefined && (
                <p className="text-sm text-gray-600">
                  Available: {currentMapping.quantityAvailable} {currentMapping.product?.unitOfMeasure || "EA"}
                </p>
              )}
            </div>

            {/* Directions Field */}
            <div className="space-y-3">
              <Label htmlFor="directions">Directions</Label>
              <textarea
                id="directions"
                placeholder="Enter directions for use..."
                value={currentMapping.directions || ""}
                onChange={(e) => isReadOnly ? undefined : setCurrentMapping({...currentMapping, directions: e.target.value})}
                disabled={isReadOnly}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-vertical"
              />
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsAddSheetOpen(false)} disabled={isReadOnly}>Cancel</Button>
            <Button
              onClick={handleSaveMapping}
              disabled={
                isReadOnly ||
                hasInsufficientStock() ||
                (editingIndex !== null && !hasEditChanges())
              }
            >
              {editingIndex !== null ? "Update" : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <AudioManager
        open={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        transcriber={transcriber}
        onTranscriptionComplete={(_transcript: string) => {
          // Handle transcript if needed for directions field
          setAudioModalOpen(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        title="Remove Medicine"
        itemName={productToDelete?.name}
        isDeleting={isDeleting}
      />
    </Card>
    </>
  )
}