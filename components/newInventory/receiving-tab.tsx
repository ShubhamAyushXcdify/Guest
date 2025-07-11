"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGetPurchaseOrders } from "@/queries/purchaseOrder/get-purchaseOrder"
import { useState } from "react";
import { PurchaseOrderReceivingSheet } from "./purchase-order-receiving-sheet";
import PurchaseOrderFilterDialog, { PurchaseOrderFilters } from "./PurchaseOrderFilterDialog";
import { Filter } from "lucide-react";

interface ReceivingTabProps {
  clinicId: string
}

export default function ReceivingTab({ clinicId }: ReceivingTabProps) {
  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});

  // Always filter by clinicId and status: "ordered"
  const queryFilters = { ...filters, clinicId, status: "ordered" };

  const { data: purchaseOrders = [], isLoading } = useGetPurchaseOrders(
    queryFilters,
    !!clinicId
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Helper to check if any filter is active (besides clinicId/status)
  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "clinicId" && key !== "status" && value
  );

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
                    Expected Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6">Loading...</td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6">No purchase orders to receive.</td>
                  </tr>
                ) : purchaseOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{order.supplier?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {order.items?.length ? `${order.items.length} items` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="theme-button-secondary"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        Receive
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
