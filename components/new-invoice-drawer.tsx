"use client"

import { useState } from "react"
import { Calendar, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface NewInvoiceDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function NewInvoiceDrawer({ isOpen, onClose }: NewInvoiceDrawerProps) {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ])

  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const updatedItems = items.filter((item) => item.id !== id)
      setItems(updatedItems)

      // Recalculate totals
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0)
      const newTax = newSubtotal * 0.08
      const newTotal = newSubtotal + newTax

      setSubtotal(newSubtotal)
      setTax(newTax)
      setTotal(newTotal)
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }

        // Recalculate amount if quantity or unitPrice changes
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice
        }

        return updatedItem
      }
      return item
    })

    setItems(updatedItems)

    // Recalculate totals
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0)
    const newTax = newSubtotal * 0.08
    const newTotal = newSubtotal + newTax

    setSubtotal(newSubtotal)
    setTax(newTax)
    setTotal(newTotal)
  }

  const handleSave = () => {
    // Here you would handle saving the invoice
    console.log("Saving invoice:", { items, subtotal, tax, total })
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          <SheetHeader
            className="text-white p-6 flex flex-row justify-between items-center"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <SheetTitle className="text-2xl font-bold text-white">Create New Invoice</SheetTitle>
          </SheetHeader>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Client/Owner */}
            <div className="space-y-2">
              <Label htmlFor="client" className="text-base font-medium">
                Client/Owner
              </Label>
              <Select>
                <SelectTrigger id="client" className="w-full">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-doe">John Doe</SelectItem>
                  <SelectItem value="jane-smith">Jane Smith</SelectItem>
                  <SelectItem value="robert-johnson">Robert Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Patient */}
            <div className="space-y-2">
              <Label htmlFor="patient" className="text-base font-medium">
                Patient
              </Label>
              <Select>
                <SelectTrigger id="patient" className="w-full">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bella">Bella (Cat)</SelectItem>
                  <SelectItem value="max">Max (Dog)</SelectItem>
                  <SelectItem value="charlie">Charlie (Dog)</SelectItem>
                  <SelectItem value="daisy">Daisy (Rabbit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate" className="text-base font-medium">
                  Invoice Date
                </Label>
                <div className="relative">
                  <Input
                    id="invoiceDate"
                    type="date"
                    className="w-full pr-10"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-base font-medium">
                  Due Date
                </Label>
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    className="w-full pr-10"
                    defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Items</Label>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-2 text-center text-sm font-medium w-16">Qty</th>
                      <th className="px-4 py-2 text-center text-sm font-medium w-24">Unit Price</th>
                      <th className="px-4 py-2 text-right text-sm font-medium w-24">Amount</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-2">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Enter description"
                            className="border-0 p-0 h-8 focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                            min="1"
                            className="border-0 p-0 h-8 text-center focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className="border-0 p-0 h-8 text-center focus-visible:ring-0"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">${item.amount.toFixed(2)}</td>
                        <td className="px-2 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length <= 1}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" className="mt-4 theme-button-outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between border-t pt-4">
                <span className="font-medium">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t mt-auto">
            <div className="flex justify-between space-x-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} className="flex-1 theme-button text-white">
                Save Invoice
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
