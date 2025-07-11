"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useGetPurchaseOrderById } from "@/queries/purchaseOrder/get-purchaseOrder-by-id"

interface PurchaseOrderDetailsSheetProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PurchaseOrderDetailsSheet({
  orderId,
  open,
  onOpenChange,
}: PurchaseOrderDetailsSheetProps) {
  const { data: order, isLoading, isError } = useGetPurchaseOrderById(orderId || "", !!orderId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[40%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Purchase Order Details</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : isError ? (
          <div className="p-6 text-center text-red-500">Failed to load purchase order details.</div>
        ) : order ? (
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order #</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{order.orderNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{order.supplier?.name || "-"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Delivery</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Delivery</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{order.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.subtotal ? `$${order.subtotal.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.taxAmount ? `$${order.taxAmount.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Discount</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.discount ? `$${order.discount.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Extended Amount</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.extendedAmount ? `$${order.extendedAmount.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.totalAmount ? `$${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits:2})}` : "-"}
                </p>
              </div>
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{order.notes || "-"}</p>
              </div>
            </div>
            {/* Items Table */}
            {order.items && order.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1">Product</th>
                        <th className="text-left px-2 py-1">Quantity Ordered</th>
                        <th className="text-left px-2 py-1">Unit Cost</th>
                        <th className="text-left px-2 py-1">Total Cost</th>
                        <th className="text-left px-2 py-1">Discount</th>
                        <th className="text-left px-2 py-1">Extended Amount</th>
                        <th className="text-left px-2 py-1">Total Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-2 py-1">{item.product?.name || item.productName || "-"}</td>
                          <td className="px-2 py-1">{item.quantityOrdered}</td>
                          <td className="px-2 py-1">{item.unitCost ? `$${item.unitCost.toFixed(2)}` : "-"}</td>
                          <td className="px-2 py-1">{item.totalCost ? `$${item.totalCost.toFixed(2)}` : "-"}</td>
                          <td className="px-2 py-1">{item.discount ? `$${item.discount.toFixed(2)}` : "-"}</td>
                          <td className="px-2 py-1">{item.extendedAmount ? `$${item.extendedAmount.toFixed(2)}` : "-"}</td>
                          <td className="px-2 py-1">{item.totalUnits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No data found.</div>
        )}
      </SheetContent>
    </Sheet>
  )
}