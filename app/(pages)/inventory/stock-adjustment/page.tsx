"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InventoryBreadcrumb } from "@/components/inventory/inventory-breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StockAdjustmentPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out" | "transfer">("in")
  const [quantity, setQuantity] = useState<number>(0)
  const [unitCost, setUnitCost] = useState<string>("")
  const [adjustmentDate, setAdjustmentDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [reference, setReference] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [adjustedBy, setAdjustedBy] = useState<string>("")

  // Mock product data
  const mockProduct: Product = {
    name: "Cephalexin 500mg",
    sku: "MED-001",
    category: "Medications",
    supplier: "Covetrus",
    currentStock: 3,
    reorderPoint: 10,
    unitCost: 15.75,
    location: "Shelf B-12",
  }

  const handleSearch = () => {
    // In a real app, this would search for the product
    setSelectedProduct(mockProduct)
    setUnitCost(mockProduct.unitCost.toString())
  }

  const calculateNewStockLevel = (): number => {
    if (!selectedProduct) return 0

    switch (adjustmentType) {
      case "in":
        return selectedProduct.currentStock + quantity
      case "out":
        return selectedProduct.currentStock - quantity
      case "transfer":
        return selectedProduct.currentStock // Transfer doesn't change total stock
      default:
        return selectedProduct.currentStock
    }
  }

  const handleSaveAdjustment = () => {
    alert("Stock adjustment saved!")
    // In a real app, this would save the adjustment to the database
  }

  return (
    <>
      <div className="p-6">
      

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stock Adjustment</h1>

        <Card className="bg-white dark:bg-slate-800 shadow-sm mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Adjust Inventory Stock</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Record stock additions, removals, or transfers with proper documentation
            </p>

            {/* Step 1: Select Product */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">1. Select Product</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Input type="text" placeholder="Search products..." className="w-full" />
                </div>
                <div className="w-full md:w-64">
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Category: All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Category: All</SelectItem>
                      <SelectItem value="medications">Medications</SelectItem>
                      <SelectItem value="vaccines">Vaccines</SelectItem>
                      <SelectItem value="supplies">Medical Supplies</SelectItem>
                      <SelectItem value="food">Food & Supplements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="theme-button text-white" onClick={handleSearch}>
                  Search
                </Button>
              </div>

              {selectedProduct && (
                <Card className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="mb-4 md:mb-0">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {selectedProduct.sku} | Category: {selectedProduct.category} | Supplier:{" "}
                          {selectedProduct.supplier}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Current Stock:</p>
                          <p
                            className={`font-semibold ${selectedProduct.currentStock < selectedProduct.reorderPoint ? "text-red-600" : "text-gray-900 dark:text-white"}`}
                          >
                            {selectedProduct.currentStock}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Reorder Point:</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.reorderPoint}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Unit Cost:</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${selectedProduct.unitCost.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Location:</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.location}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Step 2: Adjustment Type */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">2. Adjustment Type</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  className={adjustmentType === "in" ? "theme-button text-white" : "theme-button-outline"}
                  onClick={() => setAdjustmentType("in")}
                >
                  Stock In
                </Button>
                <Button
                  className={adjustmentType === "out" ? "theme-button text-white" : "theme-button-outline"}
                  onClick={() => setAdjustmentType("out")}
                >
                  Stock Out
                </Button>
                <Button
                  className={adjustmentType === "transfer" ? "theme-button text-white" : "theme-button-outline"}
                  onClick={() => setAdjustmentType("transfer")}
                >
                  Transfer
                </Button>
              </div>
            </div>

            {/* Step 3: Adjustment Details */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">3. Adjustment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quantity">Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="unitCost">Unit Cost ($):</Label>
                  <Input
                    id="unitCost"
                    type="text"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="adjustmentDate">Adjustment Date:</Label>
                  <Input
                    id="adjustmentDate"
                    type="date"
                    value={adjustmentDate}
                    onChange={(e) => setAdjustmentDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Reference:</Label>
                  <Input
                    id="reference"
                    type="text"
                    placeholder="PO-482"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reason">Reason:</Label>
                  <Textarea
                    id="reason"
                    placeholder="Received order from Covetrus"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="adjustedBy">Adjusted By:</Label>
                  <Input
                    id="adjustedBy"
                    type="text"
                    placeholder="Dr. Smith"
                    value={adjustedBy}
                    onChange={(e) => setAdjustedBy(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons and Summary */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex gap-4 mb-4 md:mb-0">
                <Button className="theme-button text-white" onClick={handleSaveAdjustment}>
                  Save Adjustment
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>

              {selectedProduct && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">New Stock Level:</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{calculateNewStockLevel()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Type definitions
interface Product {
  name: string
  sku: string
  category: string
  supplier: string
  currentStock: number
  reorderPoint: number
  unitCost: number
  location: string
}
