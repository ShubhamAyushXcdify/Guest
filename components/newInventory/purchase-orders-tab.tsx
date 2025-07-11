"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, PackageCheck, Clock, Check, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

  // Always include clinicId in filters
  const apiFilters = useMemo(() => ({ ...filters, clinicId }), [filters, clinicId])

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
      
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-6">Loading purchase orders...</td></tr>
                ) : isError ? (
                  <tr><td colSpan={8} className="text-center py-6 text-red-500">Error loading data: {error?.message || 'Please try again'}</td></tr>
                ) : purchaseOrders.length === 0 && isLoaded ? (
                  <tr><td colSpan={8} className="text-center py-6">No purchase orders found.</td></tr>
                ) : purchaseOrders.map((order: PurchaseOrderData) => {
                  const statusBadge = getStatusBadge(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer" 
                      onClick={() => {
                        setSelectedOrderId(order.id || '');
                        setIsSheetOpen(true);
                      }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {order.orderNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {order.supplier?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {order.orderDate ? formatDate(order.orderDate) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Eye
                          className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(order.id || '');
                            setIsSheetOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
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
