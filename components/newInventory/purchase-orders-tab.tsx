"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useGetPurchaseOrders } from "@/queries/purchaseOrder/get-purchaseOrder"
import PurchaseOrderFilterDialog, { PurchaseOrderFilters } from "./PurchaseOrderFilterDialog"
import type { PurchaseOrderData } from "@/queries/purchaseOrder/create-purchaseOrder";
import PurchaseOrderDetailsSheet from "./purhchase-order-details-sheet"

interface PurchaseOrdersTabProps {
  clinicId: string
  onNewOrder: () => void
}

export default function PurchaseOrdersTab({ clinicId, onNewOrder }: PurchaseOrdersTabProps) {
  // Filters state
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  // Always include clinicId in filters
  const apiFilters = useMemo(() => ({ 
    ...filters, 
    clinicId,
    search: searchQuery,
    pageNumber: page,
    pageSize
  }), [filters, clinicId, searchQuery, page, pageSize]);

  // Fetch purchase orders
  const { data: purchaseOrders = [], isLoading, refetch } = useGetPurchaseOrders(apiFilters, !!clinicId);

  // Refetch when clinicId or filters change
  useEffect(() => {
    if (clinicId) refetch();
  }, [clinicId, filters, refetch]);

  // Count active filters (excluding clinicId)
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'clinicId').length;

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
      cell: ({ getValue }) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {getValue() as string}
        </span>
      )
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
              setSelectedOrderId(row.original.id);
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
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">From: {filters.dateFrom}</span>
          )}
          {filters.dateTo && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">To: {filters.dateTo}</span>
          )}
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
        totalPages={1} // You'll need to get this from your API response
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
