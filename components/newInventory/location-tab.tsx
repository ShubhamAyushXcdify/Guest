"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useGetInventoryInfinite } from "@/queries/inventory/get-inventory"
import { useGetPurchaseOrders } from "@/queries/purchaseOrder/get-purchaseOrder"
import { Filter, Loader2, Eye, MapPin, Edit, Save, X, AlertTriangle, Package, FileText } from "lucide-react"
import { InventoryData } from "@/queries/inventory/get-inventory"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "../ui/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import LocationFilterDialog, { LocationFilters } from "./location-filter-dialog"
import { useUpdateInventoryLocation } from "@/queries/inventory/update-inventory-location"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { useGetReceivedPurchaseOrders } from "@/queries/purchaseOrderReceiving/get-received-purchase-orders"
import { useUpdateReceivingHistory } from "@/queries/purchaseOrderReceiving/update-receiving-history"
import { ReceivedItem, PurchaseOrderData, PurchaseOrderItem } from "@/queries/purchaseOrder/create-purchaseOrder"


interface LocationsTabProps {
  clinicId: string
}

// Form schema for location assignment
const locationFormSchema = z.object({
  shelf: z.string().min(1, "Shelf is required"),
  bin: z.string().min(1, "Bin is required"),
  notes: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

// Type for batch data
interface BatchData {
  productId: string
  productName: string
  batchNumber: string
  totalQuantity: number
  location: string | null
  expirationDate: string | null
  receivedDate: string | null
  reorderThreshold: number
  items: InventoryData[]
  // Purchase order information
  orderNumber?: string
  supplierName?: string
  quantityReceived?: number
  isReceivedItem?: boolean
  // Purchase order specific fields
  purchaseOrderId?: string
  purchaseOrderItemId?: string
  quantityOrdered?: number
  unitCost?: number
  status?: string
  isPurchaseOrderItem?: boolean
}

export default function LocationsTab({ clinicId }: LocationsTabProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<LocationFilters>({})
  const [openFilter, setOpenFilter] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryData | null>(null)
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<BatchData | null>(null)
  const [activeTab, setActiveTab] = useState<"located" | "unlocated">("unlocated")

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useGetInventoryInfinite(
    { 
      clinicId,
      pageSize,
      search: searchQuery,
      ...filters,
    },
    !!clinicId
  )

  // Fetch purchase orders with received and partial status
  const {
    data: purchaseOrders = [],
    isLoading: purchaseOrdersLoading,
    isError: purchaseOrdersError
  } = useGetPurchaseOrders(
    { 
      clinicId,
      status: "received,partial",
      pageSize: 100 // Get more purchase orders to process
    },
    !!clinicId
  )

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  // Mutation for updating inventory location
  const updateLocationMutation = useUpdateInventoryLocation()
  
  // Query for received purchase orders
  const {
    data: receivedItems = [],
    error: receivedError,
    isLoading: receivedLoading,
    isError: receivedIsError
  } = useGetReceivedPurchaseOrders(
    { 
      clinicId,
    },
    !!clinicId
  )
  
  
  // Mutation for updating receiving history
  const updateReceivingHistoryMutation = useUpdateReceivingHistory()
  
  console.log('Update receiving history mutation:', updateReceivingHistoryMutation)
  


  // Form for location assignment
  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      shelf: "",
      bin: "",
      notes: "",
    },
  })

  // Group inventory items by batch and include purchase orders
  const batches = useMemo(() => {
    const allItems = data?.pages.flatMap(page => page.items) || []
    const batchMap = new Map<string, BatchData>()

    // Process inventory items
    allItems.forEach(item => {
      const batchKey = `${item.productId}-${item.batchNumber}`
      
      if (!batchMap.has(batchKey)) {
        batchMap.set(batchKey, {
          productId: item.productId,
          productName: item.product?.name || 'N/A',
          batchNumber: item.batchNumber || 'N/A',
          totalQuantity: 0,
          location: item.location,
          expirationDate: item.expirationDate,
          receivedDate: item.receivedDate,
          reorderThreshold: item.product?.reorderThreshold || 0,
          items: [],
          isReceivedItem: false,
          isPurchaseOrderItem: false
        })
      }

      const batch = batchMap.get(batchKey)!
      batch.totalQuantity += item.quantityOnHand
      batch.items.push(item)
      
      // Use the first location found for the batch
      if (!batch.location && item.location) {
        batch.location = item.location
      }
    })

    // Process purchase order items
    purchaseOrders.forEach((purchaseOrder: PurchaseOrderData) => {
      purchaseOrder.items?.forEach((item: PurchaseOrderItem) => {
        if (item.batchNumber) {
          const batchKey = `${item.productId}-${item.batchNumber}`
          
          if (!batchMap.has(batchKey)) {
            // Create new batch for purchase order item
            batchMap.set(batchKey, {
              productId: item.productId,
              productName: item.product?.name || 'N/A',
              batchNumber: item.batchNumber,
              totalQuantity: item.quantityReceived || 0,
              location: null, // Purchase order items don't have location initially
              expirationDate: item.expirationDate || null,
              receivedDate: item.actualDeliveryDate || null,
              reorderThreshold: 0,
              items: [],
              orderNumber: purchaseOrder.orderNumber,
              supplierName: purchaseOrder.supplier?.name,
              quantityReceived: item.quantityReceived,
              quantityOrdered: item.quantityOrdered,
              unitCost: item.unitCost,
              status: purchaseOrder.status,
              purchaseOrderId: purchaseOrder.id,
              purchaseOrderItemId: item.id,
              isReceivedItem: false,
              isPurchaseOrderItem: true
            })
          } else {
            // Update existing batch with purchase order info
            const batch = batchMap.get(batchKey)!
            batch.totalQuantity += (item.quantityReceived || 0)
            batch.orderNumber = purchaseOrder.orderNumber
            batch.supplierName = purchaseOrder.supplier?.name
            batch.quantityReceived = (batch.quantityReceived || 0) + (item.quantityReceived || 0)
            batch.quantityOrdered = (batch.quantityOrdered || 0) + item.quantityOrdered
            batch.unitCost = item.unitCost
            batch.status = purchaseOrder.status
            batch.purchaseOrderId = purchaseOrder.id
            batch.purchaseOrderItemId = item.id
            batch.isPurchaseOrderItem = true
          }
        }
      })
    })

    // Process received purchase order items
    receivedItems.forEach(receivedItem => {
      const batchKey = `${receivedItem.productId}-${receivedItem.batchNumber}`
      
      if (!batchMap.has(batchKey)) {
        // Create new batch for received item
        batchMap.set(batchKey, {
          productId: receivedItem.productId,
          productName: receivedItem.productName || 'N/A',
          batchNumber: receivedItem.batchNumber,
          totalQuantity: receivedItem.quantityReceived,
          location: receivedItem.location || null,
          expirationDate: receivedItem.expiryDate || null,
          receivedDate: receivedItem.receivedDate || null,
          reorderThreshold: 0,
          items: [],
          orderNumber: receivedItem.orderNumber,
          supplierName: receivedItem.supplierName,
          quantityReceived: receivedItem.quantityReceived,
          isReceivedItem: true,
          isPurchaseOrderItem: false
        })
      } else {
        // Update existing batch with received item info
        const batch = batchMap.get(batchKey)!
        batch.totalQuantity += receivedItem.quantityReceived
        batch.orderNumber = receivedItem.orderNumber
        batch.supplierName = receivedItem.supplierName
        batch.quantityReceived = (batch.quantityReceived || 0) + receivedItem.quantityReceived
        batch.isReceivedItem = true
        
        // Use received item location if inventory item doesn't have one
        if (!batch.location && receivedItem.location) {
          batch.location = receivedItem.location
        }
      }
    })

    return Array.from(batchMap.values())
  }, [data, purchaseOrders, receivedItems])

  // Filter batches based on active tab
  const filteredBatches = useMemo(() => {
    if (activeTab === "located") {
      return batches.filter(batch => batch.location)
    } else {
      return batches.filter(batch => !batch.location)
    }
  }, [batches, activeTab])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const handleAssignLocation = (batch: BatchData) => {
    setSelectedBatch(batch)
    // Pre-fill form with existing location if available
    if (batch.location) {
      const locationParts = batch.location.split('-')
      locationForm.reset({
        shelf: locationParts[0] || "",
        bin: locationParts[1] || "",
        notes: "",
      })
    } else {
      locationForm.reset({
        shelf: "",
        bin: "",
        notes: "",
      })
    }
    setLocationDialogOpen(true)
  }

  const handleSaveLocation = async (values: LocationFormValues) => {
    if (!selectedBatch) return

    const newLocation = `${values.shelf}-${values.bin}`
    
    try {
      if (selectedBatch.isReceivedItem) {
        // Handle received purchase order items using useUpdateReceivingHistory
        const receivedItem = receivedItems.find(item => 
          item.productId === selectedBatch.productId && 
          item.batchNumber === selectedBatch.batchNumber
        )
        
        console.log('Found received item:', receivedItem)
        console.log('Selected batch:', selectedBatch)
        
        if (receivedItem) {
          const updateData = {
            id: receivedItem.id,
            purchaseOrderId: receivedItem.purchaseOrderId,
            purchaseOrderItemId: receivedItem.purchaseOrderItemId,
            productId: receivedItem.productId,
            clinicId: clinicId,
            quantityReceived: receivedItem.quantityReceived,
            batchNumber: receivedItem.batchNumber,
            expiryDate: receivedItem.expiryDate,
            receivedDate: receivedItem.receivedDate,
            receivedBy: receivedItem.receivedBy,
            notes: values.notes,
            unitCost: receivedItem.unitCost,
            lotNumber: receivedItem.lotNumber,
            supplierId: receivedItem.supplierId,
            quantityOnHand: receivedItem.quantityInHand || 0,
            barcode: receivedItem.barcode,
            shelf: values.shelf,
            bin: values.bin,
          }
          
          console.log('Updating with data:', updateData)
          
          const result = await updateReceivingHistoryMutation.mutateAsync(updateData)
          console.log('Update result:', result)
        }
      } else if (selectedBatch.isPurchaseOrderItem) {
        // Handle purchase order items - create received item or update existing
        const receivedItem = receivedItems.find(item => 
          item.productId === selectedBatch.productId && 
          item.batchNumber === selectedBatch.batchNumber &&
          item.purchaseOrderItemId === selectedBatch.purchaseOrderItemId
        )
        
        console.log('Found purchase order item:', receivedItem)
        console.log('Selected batch (PO):', selectedBatch)
        
        if (receivedItem) {
          const updateData = {
            id: receivedItem.id,
            purchaseOrderId: receivedItem.purchaseOrderId,
            purchaseOrderItemId: receivedItem.purchaseOrderItemId,
            productId: receivedItem.productId,
            clinicId: clinicId,
            quantityReceived: receivedItem.quantityReceived,
            batchNumber: receivedItem.batchNumber,
            expiryDate: receivedItem.expiryDate,
            receivedDate: receivedItem.receivedDate,
            receivedBy: receivedItem.receivedBy,
            notes: values.notes,
            unitCost: receivedItem.unitCost,
            lotNumber: receivedItem.lotNumber,
            supplierId: receivedItem.supplierId,
            quantityOnHand: receivedItem.quantityInHand || 0,
            barcode: receivedItem.barcode,
            shelf: values.shelf,
            bin: values.bin,
          }
          
          console.log('Updating PO item with data:', updateData)
          
          const result = await updateReceivingHistoryMutation.mutateAsync(updateData)
          console.log('Update PO result:', result)
        } else {
          // Create new received item for purchase order item
          // This would require a new API call to create received item
          toast({
            title: "Info",
            description: "Location will be assigned when item is received",
          })
        }
      } else {
        // Handle inventory items
        const updatePromises = selectedBatch.items.map(item =>
          updateLocationMutation.mutateAsync({
            id: item.id,
            location: newLocation,
            notes: values.notes,
          })
        )
        await Promise.all(updatePromises)
      }
      
      toast({
        title: "Location Updated",
        description: `Location ${newLocation} assigned to batch ${selectedBatch.batchNumber}`,
      })
      
      setLocationDialogOpen(false)
      setSelectedBatch(null)
      locationForm.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      })
    }
  }
  


  const getLocationDisplay = (location: string | null) => {
    if (!location) return "Not assigned"
    
    const parts = location.split('-')
    if (parts.length >= 2) {
      return (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-500" />
          <span className="font-medium">Shelf {parts[0]}</span>
          <span className="text-gray-500">•</span>
          <span className="font-medium">Bin {parts[1]}</span>
        </div>
      )
    }
    return location
  }

  const getStockStatus = (quantity: number, reorderThreshold: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (reorderThreshold > 0 && quantity <= reorderThreshold) return { status: 'Low Stock', color: 'bg-orange-100 text-orange-800' }
    if (reorderThreshold > 0 && quantity <= reorderThreshold * 1.5) return { status: 'Warning', color: 'bg-amber-100 text-amber-800' }
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return { color: 'bg-green-100 text-green-800', icon: <Package className="w-3 h-3 mr-1" /> }
      case 'partial':
        return { color: 'bg-amber-100 text-amber-800', icon: <FileText className="w-3 h-3 mr-1" /> }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: null }
    }
  }

  const columns: ColumnDef<BatchData>[] = [
    { 
      accessorKey: "orderNumber", 
      header: "Order Number",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.orderNumber ? (
            <div className="flex items-center gap-1">
              <span className="text-blue-600 font-medium">{row.original.orderNumber}</span>
              {row.original.isReceivedItem && (
                <Badge variant="outline" className="text-xs">Received</Badge>
              )}
            </div>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>
      )
    },
    { 
      accessorKey: "productName", 
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.productName}</div>
      )
    },
    { 
      accessorKey: "batchNumber", 
      header: "Batch Number",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.batchNumber}</div>
      )
    },
    { 
      accessorKey: "supplierName", 
      header: "Supplier",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.supplierName || <span className="text-gray-500">N/A</span>}
        </div>
      )
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        if (status) {
          const badge = getStatusBadge(status);
          return (
            <span className={`px-2 py-1 text-xs font-medium ${badge.color} rounded-full flex items-center justify-center w-fit`}>
              {badge.icon}
              {status}
            </span>
          );
        }
        return <span className="text-gray-500">N/A</span>
      }
    },
    { 
      accessorKey: "expirationDate", 
      header: "Expiry Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.expirationDate ? formatDate(row.original.expirationDate) : 'N/A'}
        </div>
      )
    },
    { 
      accessorKey: "receivedDate", 
      header: "Received Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.receivedDate ? formatDate(row.original.receivedDate) : 'N/A'}
        </div>
      )
    },
    { 
      accessorKey: "location", 
      header: "Current Location",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getLocationDisplay(row.original.location)}
        </div>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const batch = row.original
        return (
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                handleAssignLocation(batch);
              }}
              className="flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              {batch.location ? 'Update' : 'Assign'}
            </Button>
          </div>
        )
      },
      meta: { className: "text-center" },
    },
  ]



  const totalPages = data?.pages[0]?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Management</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 border rounded text-sm"
            onClick={() => setOpenFilter(true)}
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
         <div className="flex flex-wrap gap-2 mb-2 items-center">
           {filters.search && (
             <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
               Search: {filters.search}
             </span>
           )}
           {filters.shelf && (
             <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
               Shelf: {filters.shelf}
             </span>
           )}
           {filters.bin && (
             <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
               Bin: {filters.bin}
             </span>
           )}
           {filters.batchNumber && (
             <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
               Batch: {filters.batchNumber}
             </span>
           )}
           <button 
             className="text-xs text-gray-500 underline"
             onClick={() => setFilters({})}
           >
             Clear all
           </button>
         </div>
      )}

      {/* Tabs for Located and Unlocated Batches */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "located" | "unlocated")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unlocated" className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Unlocated Batches
            <Badge variant="secondary" className="ml-1">
              {batches.filter(batch => !batch.location).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="located" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Located Batches
            <Badge variant="secondary" className="ml-1">
              {batches.filter(batch => batch.location).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unlocated" className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-medium text-amber-800">Unlocated Batches</h4>
                <p className="text-sm text-amber-700">
                  These batches need shelf and bin locations assigned. Click "Assign" to set their storage location.
                </p>
              </div>
            </div>
          </div>
          
          <DataTable
            columns={columns}
            data={filteredBatches}
            searchPlaceholder="Search by product name or batch number..."
            onSearch={handleSearch}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </TabsContent>

        <TabsContent value="located" className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Located Batches</h4>
                <p className="text-sm text-green-700">
                  These batches have assigned shelf and bin locations. Click "Update" to modify their storage location.
                </p>
              </div>
            </div>
          </div>
          
          <DataTable
            columns={columns}
            data={filteredBatches}
            searchPlaceholder="Search by product name, batch number, or location..."
            onSearch={handleSearch}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </TabsContent>


      </Tabs>

      {/* Filter Dialog */}
      <LocationFilterDialog
        isOpen={openFilter}
        onOpenChange={setOpenFilter}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Location Assignment Sheet */}
      <Sheet open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {selectedBatch?.location ? 'Update Location' : 'Assign Location'}
              {selectedBatch?.isReceivedItem ? ' (Received Item)' : 
               selectedBatch?.isPurchaseOrderItem ? ' (Purchase Order Item)' : ' (Inventory Batch)'}
            </SheetTitle>
          </SheetHeader>
          <Form {...locationForm}>
            <form onSubmit={locationForm.handleSubmit(handleSaveLocation)} className="space-y-4">
              {selectedBatch && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium">{selectedBatch.productName}</p>
                  <p className="text-xs text-gray-600">Batch: {selectedBatch.batchNumber}</p>
                  {selectedBatch.isReceivedItem ? (
                    <>
                      <p className="text-xs text-gray-600">Order: {selectedBatch.orderNumber}</p>
                      <p className="text-xs text-gray-600">Supplier: {selectedBatch.supplierName}</p>
                      <p className="text-xs text-gray-600">Quantity Received: {selectedBatch.quantityReceived}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Note:</strong> This location will apply to this received purchase order item
                      </p>
                    </>
                  ) : selectedBatch.isPurchaseOrderItem ? (
                    <>
                      <p className="text-xs text-gray-600">Order: {selectedBatch.orderNumber}</p>
                      <p className="text-xs text-gray-600">Supplier: {selectedBatch.supplierName}</p>
                      <p className="text-xs text-gray-600">Status: {selectedBatch.status}</p>
                      <p className="text-xs text-gray-600">Quantity Ordered: {selectedBatch.quantityOrdered}</p>
                      <p className="text-xs text-gray-600">Quantity Received: {selectedBatch.quantityReceived}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Note:</strong> This location will apply to this purchase order item
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600">Total Stock: {selectedBatch.totalQuantity}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <strong>Note:</strong> This location will apply to all items in this batch
                      </p>
                    </>
                  )}
                </div>
              )}
              
              <FormField
                control={locationForm.control}
                name="shelf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A, B, C, 1, 2, 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={locationForm.control}
                name="bin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bin Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 01, 02, 15, 23" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={locationForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional location notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocationDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateLocationMutation.isPending || updateReceivingHistoryMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {(updateLocationMutation.isPending || updateReceivingHistoryMutation.isPending) ? 'Saving...' : 'Save Batch Location'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>


    </div>
  )
}
