"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, PackageCheck, Clock, Check, AlertCircle, Eye, Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useGetPurchaseOrders } from "@/queries/purchaseOrder/get-purchaseOrder"
import { getPurchaseOrderById } from "@/queries/purchaseOrder/get-purchaseOrder-by-id"
import PurchaseOrderFilterDialog, { PurchaseOrderFilters } from "./PurchaseOrderFilterDialog"
import type { PurchaseOrderData } from "@/queries/purchaseOrder/create-purchaseOrder"
import PurchaseOrderDetailsSheet from "./purhchase-order-details-sheet"
import { formatDate } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface PurchaseOrdersTabProps {
  clinicId: string
  onNewOrder: () => void
}

// Function to determine status badge color
const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'ordered':
      return {
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-3 h-3 mr-1" />
      }
    case 'received':
      return {
        color: 'bg-green-100 text-green-800',
        icon: <Check className="w-3 h-3 mr-1" />
      }
    case 'partial':
      return {
        color: 'bg-amber-100 text-amber-800',
        icon: <PackageCheck className="w-3 h-3 mr-1" />
      }
    case 'cancelled':
      return {
        color: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="w-3 h-3 mr-1" />
      }
    default:
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: null
      }
  }
}

// Format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export default function PurchaseOrdersTab({ clinicId, onNewOrder }: PurchaseOrdersTabProps) {
  // Filters state
  const [filters, setFilters] = useState<PurchaseOrderFilters>({})
  const [openFilter, setOpenFilter] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  // Add pagination and search state
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  
  // PDF print state
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<PurchaseOrderData | null>(null)
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false)

  // Always include clinicId in filters
  const apiFilters = useMemo(() => ({ 
    ...filters, 
    clinicId,
    page,
    pageSize
  }), [filters, clinicId, page, pageSize])


  // Fetch purchase orders
  const { 
    data: purchaseOrders = [], 
    isLoading, 
    isError,
    error,
    refetch 
  } = useGetPurchaseOrders(apiFilters, !!clinicId)



  // Refetch when clinicId or filters change
  useEffect(() => {
    if (clinicId) {
      refetch().then(() => setIsLoaded(true))
    }
  }, [clinicId, filters, refetch])

  // Count active filters (excluding clinicId)
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'clinicId').length

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

  const handlePrintOrder = async (order: PurchaseOrderData) => {
    try {
      // Fetch the full order data including PDF
      const fullOrder = await getPurchaseOrderById(order.id!)
      
      if (fullOrder.pdfBase64) {
        try {
          const blob = await fetch(`data:application/pdf;base64,${fullOrder.pdfBase64}`).then(res => res.blob());
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          // Clean up the URL after a delay
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
          // Fallback to sheet display
          setSelectedOrderForPrint(fullOrder)
          setIsPrintSheetOpen(true)
        }
      } else {
        // Show sheet with no PDF message
        setSelectedOrderForPrint(fullOrder)
        setIsPrintSheetOpen(true)
      }
    } catch (error) {
      // Fallback to original order data
      setSelectedOrderForPrint(order)
      setIsPrintSheetOpen(true)
    }
  }

  const handleDownloadPDF = () => {
    if (selectedOrderForPrint?.pdfBase64) {
      const byteCharacters = atob(selectedOrderForPrint.pdfBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `PurchaseOrder_${selectedOrderForPrint.orderNumber}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const columns: ColumnDef<PurchaseOrderData>[] = [
    { 
      accessorKey: "orderNumber", 
      header: "Order #",
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue() as string}</div>
      )
    },
    { 
      accessorKey: "supplier.name", 
      header: "Supplier",
      cell: ({ row }) => row.original.supplier?.name || "-"
    },
    { 
      accessorKey: "orderDate", 
      header: "Date",
      cell: ({ getValue }) => {
        const date = getValue() as string
        return date ? new Date(date).toLocaleDateString() : "-"
      }
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const badge = getStatusBadge(status);
        return (
          <span className={`px-2 py-1 text-xs font-medium ${badge.color} rounded-full flex items-center justify-center w-fit`}>
            {badge.icon}
            {status}
          </span>
        );
      }
    },
    { 
      accessorKey: "totalAmount", 
      header: "Total",
      cell: ({ getValue }) => {
        const amount = getValue() as number
        return amount ? `₹${amount.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"
      }
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600"
            onClick={() => {
              setSelectedOrderId(row.original.id || null);
              setIsSheetOpen(true);
            }}
          >
            <Eye className="mr-1 h-4 w-4" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-green-50 border-green-500 text-green-500 hover:text-green-600 hover:border-green-600"
            onClick={() => handlePrintOrder(row.original)}
          >
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
        </div>
      ),
      meta: { className: "text-center" },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Orders</h3>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 border rounded text-sm"
            onClick={() => setOpenFilter(true)}
          >
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">{activeFilterCount}</span>
            )}
          </button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onNewOrder}
          >
            <Plus className="mr-2 h-4 w-4" /> New Order
          </Button>
        </div>
      </div>
      
      {/* Active Filters Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {filters.orderNumber && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Order #: {filters.orderNumber}</span>
          )}
          {filters.supplierId && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Supplier: {filters.supplierId}</span>
          )}
          {filters.status && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Status: {filters.status}</span>
          )}
          {filters.dateFrom && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">From: {formatDate(filters.dateFrom)}</span>
          )}
          {filters.dateTo && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">To: {formatDate(filters.dateTo)}</span>
          )}
          <button 
            className="text-xs text-gray-500 underline"
            onClick={() => setFilters({})}
          >
            Clear all
          </button>
        </div>
      )}


      <DataTable
        columns={columns}
        data={purchaseOrders}
        searchColumn="orderNumber"
        searchPlaceholder="Search orders..."
        onSearch={handleSearch}
        page={page}
        pageSize={pageSize}
        totalPages={1} // This will be updated when API returns proper pagination
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Filter Dialog */}
      <PurchaseOrderFilterDialog
        isOpen={openFilter}
        onOpenChange={setOpenFilter}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Sheet for details */}
      <PurchaseOrderDetailsSheet
        orderId={selectedOrderId}
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open);
          if (!open) setSelectedOrderId(null);
        }}
      />

      {/* Print PDF Sheet */}
      <Sheet open={isPrintSheetOpen} onOpenChange={setIsPrintSheetOpen}>
        <SheetContent className="w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Purchase Order PDF</span>
              {selectedOrderForPrint && (
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
                     <div className="mt-4 h-full">
             {selectedOrderForPrint?.pdfBase64 ? (
               <div className="h-full">
                 <div className="mb-2 text-sm text-gray-600">
                   PDF Data Length: {selectedOrderForPrint.pdfBase64.length} characters
                 </div>
                                   <object
                    data={`data:application/pdf;base64,${selectedOrderForPrint.pdfBase64}`}
                    type="application/pdf"
                    className="w-full h-[calc(100%-40px)] border border-gray-300 rounded"
                  >
                   <p>Your browser does not support PDF display. 
                     <button 
                       onClick={handleDownloadPDF}
                       className="ml-2 text-blue-600 underline"
                     >
                       Click here to download the PDF
                     </button>
                   </p>
                 </object>
               </div>
             ) : (
               <div className="flex items-center justify-center h-full text-gray-500">
                 No PDF available for this order
               </div>
             )}
           </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
