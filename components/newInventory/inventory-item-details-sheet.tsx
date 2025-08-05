"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useGetProductById } from "@/queries/products/get-product-by-id"
import { useGetPurchaseOrderHistoryByProductIdClinicId } from "@/queries/purchaseOrderReceiving/get-purchase-order-history-by-productId-clinidId"
import { formatDate } from "@/lib/utils"
import { InventoryData } from "@/queries/inventory/get-inventory"
import { Loader2, Package, History, AlertTriangle, CheckCircle, XCircle, Database } from "lucide-react"

// Format currency consistently
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

interface InventoryItemDetailsSheetProps {
  inventoryItem: InventoryData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function InventoryItemDetailsSheet({
  inventoryItem,
  open,
  onOpenChange,
}: InventoryItemDetailsSheetProps) {
  const productId = inventoryItem?.productId
  const clinicId = inventoryItem?.clinicId

  const { data: product, isLoading: productLoading, isError: productError } = useGetProductById(
    productId || "", 
    !!productId
  )

  const { data: purchaseHistory, isLoading: historyLoading, isError: historyError } = useGetPurchaseOrderHistoryByProductIdClinicId(
    productId || "",
    clinicId || ""
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />In Stock</Badge>
      case 'Out of Stock':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Out of Stock</Badge>
      case 'Warning':
        return <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>
      case 'Low Stock':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockStatus = () => {
    if (!inventoryItem) return 'Unknown'
    
    const quantity = inventoryItem.quantityOnHand
    const reorderThreshold = inventoryItem.product?.reorderThreshold || 0
    
    if (quantity === 0) return 'Out of Stock'
    if (reorderThreshold > 0 && quantity <= reorderThreshold) return 'Low Stock'
    if (reorderThreshold > 0 && quantity <= reorderThreshold * 1.5) return 'Warning'
    return 'In Stock'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[60%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Item Details
          </SheetTitle>
        </SheetHeader>
        
        {!inventoryItem ? (
          <div className="p-6 text-center text-gray-500">No inventory item selected.</div>
        ) : (
          <div className="space-y-6 p-4">
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              {/* Product Information */}
              <AccordionItem value="product-info">
                <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <span className="font-semibold">Product Information</span>
                  </div>
                  {getStatusBadge(getStockStatus())}
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4">
                  {productLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading product details...
                    </div>
                  ) : productError ? (
                    <div className="text-red-500 p-4">Failed to load product details.</div>
                  ) : product ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Name</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand Name</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.brandName || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Generic Name</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.genericName || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Number</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.productNumber}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.category}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Type</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.productType}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Manufacturer</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.manufacturer || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">NDC Number</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.ndcNumber || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Strength</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.strength || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosage Form</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.dosageForm}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit of Measure</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.unitOfMeasure}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requires Prescription</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                          {product.requiresPrescription ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Requirements</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.storageRequirements || "-"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reorder Threshold</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{product.reorderThreshold || "Not set"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h4>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 p-4">Product not found.</div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Inventory Details */}
              <AccordionItem value="inventory-details">
                <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    <span className="font-semibold">Inventory Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Stock</h4>
                      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {inventoryItem.quantityOnHand}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reserved Quantity</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{inventoryItem.quantityReserved}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit Cost</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(inventoryItem.unitCost)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Wholesale Cost</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(inventoryItem.wholesaleCost)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Retail Price</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(inventoryItem.retailPrice)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{inventoryItem.location || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Batch Number</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{inventoryItem.batchNumber}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lot Number</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{inventoryItem.lotNumber || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiration Date</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {inventoryItem.expirationDate ? formatDate(inventoryItem.expirationDate) : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Manufacture</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {inventoryItem.dateOfManufacture ? formatDate(inventoryItem.dateOfManufacture) : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Received Date</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {inventoryItem.receivedDate ? formatDate(inventoryItem.receivedDate) : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Units Per Package</h4>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{inventoryItem.unitsPerPackage}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Purchase Order History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Purchase Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading purchase history...
                  </div>
                ) : historyError ? (
                  <div className="text-red-500 p-4">Failed to load purchase history.</div>
                ) : purchaseHistory && purchaseHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Order #</th>
                          <th className="text-left px-3 py-2 font-medium">Supplier</th>
                          <th className="text-center px-3 py-2 font-medium">Quantity Received</th>
                          <th className="text-right px-3 py-2 font-medium">Unit Cost</th>
                          <th className="text-left px-3 py-2 font-medium">Batch Number</th>
                          <th className="text-left px-3 py-2 font-medium">Expiry Date</th>
                          <th className="text-left px-3 py-2 font-medium">Received Date</th>
                          <th className="text-left px-3 py-2 font-medium">Received By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {(() => {
                          // Group by purchase order ID to show unique purchase orders
                          const uniqueOrders = purchaseHistory.reduce((acc, item) => {
                            const key = item.purchaseOrderId;
                            if (!acc[key]) {
                              acc[key] = {
                                ...item,
                                totalQuantity: item.quantityReceived,
                                totalCost: item.quantityReceived * item.unitCost
                              };
                            } else {
                              acc[key].totalQuantity += item.quantityReceived;
                              acc[key].totalCost += item.quantityReceived * item.unitCost;
                            }
                            return acc;
                          }, {} as Record<string, any>);

                          return Object.values(uniqueOrders).map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-3 py-2">
                                <div className="font-medium">{item.orderNumber || "-"}</div>
                              </td>
                              <td className="px-3 py-2">{item.supplierName || "-"}</td>
                              <td className="px-3 py-2 text-center font-medium">{item.totalQuantity}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(item.unitCost)}</td>
                              <td className="px-3 py-2">{item.batchNumber}</td>
                              <td className="px-3 py-2">
                                {item.expiryDate ? formatDate(item.expiryDate) : "-"}
                              </td>
                              <td className="px-3 py-2">
                                {item.receivedDate ? formatDate(item.receivedDate) : "-"}
                              </td>
                              <td className="px-3 py-2">{item.receivedByName || "-"}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-500 p-4 text-center">No purchase order history found.</div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 