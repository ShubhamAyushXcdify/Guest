"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { useGetPurchaseOrders } from "@/queries/purchaseOrder/get-purchaseOrder"
import { useState } from "react";
import { PurchaseOrderReceivingSheet } from "./purchase-order-receiving-sheet";
import PurchaseOrderFilterDialog, { PurchaseOrderFilters } from "./PurchaseOrderFilterDialog";
import { AlertCircle, Check, Clock, Filter, PackageCheck } from "lucide-react";
import { PurchaseOrderData } from "@/queries/purchaseOrder/create-purchaseOrder";

interface ReceivingTabProps {
  clinicId: string
}

export default function ReceivingTab({ clinicId }: ReceivingTabProps) {
  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  // Always filter by clinicId and status: "ordered"
  const queryFilters = { 
    ...filters, 
    clinicId, 
    status: "ordered , partial",
    search: searchQuery,
    pageNumber: page,
    pageSize
  };

  const { data: purchaseOrders = [], isLoading } = useGetPurchaseOrders(
    queryFilters,
    !!clinicId
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Helper to check if any filter is active (besides clinicId/status)
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "clinicId" && key !== "status" && value
  );

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

  const columns: ColumnDef<PurchaseOrderData>[] = [
    { 
      accessorKey: "orderNumber", 
      header: "Order #",
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue() as string}</div>
      )
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
      accessorKey: "supplier.name", 
      header: "Supplier",
      cell: ({ row }) => row.original.supplier?.name || "-"
    },
    { 
      accessorKey: "expectedDeliveryDate", 
      header: "Expected Date",
      cell: ({ getValue }) => {
        const date = getValue() as string
        return date ? new Date(date).toLocaleDateString() : "-"
      }
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => {
        const items = row.original.items
        return items?.length ? `${items.length} items` : "-"
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
            onClick={() => setSelectedOrderId(row.original.id || null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-check mr-1 h-4 w-4"><path d="M16 16h6" /><path d="m22 10-5.5 5.5-3-3" /><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 4 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" /><path d="M16 5.3V8L12 10 8 8V5.3" /></svg> Receive
          </Button>
        </div>
      ),
      meta: { className: "text-center" },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchase Order Receiving</h3>
        <Button
          variant={hasActiveFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setFilterDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Show active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-2">
          {filters.orderNumber && (
            <span className="bg-slate-100 text-xs px-2 py-1 rounded">Order #: {filters.orderNumber}</span>
          )}
          {filters.supplierId && (
            <span className="bg-slate-100 text-xs px-2 py-1 rounded">Supplier: {filters.supplierId}</span>
          )}
          {filters.status && (
            <span className="bg-slate-100 text-xs px-2 py-1 rounded">Status: {filters.status}</span>
          )}
          {filters.dateFrom && (
            <span className="bg-slate-100 text-xs px-2 py-1 rounded">From: {filters.dateFrom}</span>
          )}
          {filters.dateTo && (
            <span className="bg-slate-100 text-xs px-2 py-1 rounded">To: {filters.dateTo}</span>
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

      <PurchaseOrderReceivingSheet
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        purchaseOrderId={selectedOrderId}
      />

      {/* Filter Dialog */}
      <PurchaseOrderFilterDialog
        isOpen={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}
