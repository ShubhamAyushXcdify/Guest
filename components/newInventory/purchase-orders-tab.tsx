"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, PackageCheck, Clock, Check, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useGetPurchaseOrders } from "@/queries/purchaseOrder/get-purchaseOrder"
import PurchaseOrderFilterDialog, { PurchaseOrderFilters } from "./PurchaseOrderFilterDialog"
import type { PurchaseOrderData } from "@/queries/purchaseOrder/create-purchaseOrder"
import PurchaseOrderDetailsSheet from "./purhchase-order-details-sheet"
import { formatDate } from "@/lib/utils"

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
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
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

  // Debug log
  useEffect(() => {
    console.log("Purchase Orders Received:", purchaseOrders);
  }, [purchaseOrders]);

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
        return amount ? `$${amount.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"
      }
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="theme-button-secondary"
            onClick={() => {
              setSelectedOrderId(row.original.id || null);
              setIsSheetOpen(true);
            }}
          >
            View
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
            className="theme-button text-white"
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
    </div>
  )
}
