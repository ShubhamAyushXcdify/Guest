"use client"

import React, { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRootContext } from "@/context/RootContext"
import { getUserId } from "@/utils/clientCookie"

import { toast, useToast } from "@/components/ui/use-toast"
import { useCreatePurchaseOrder } from '@/queries/purchaseOrder/create-purchaseOrder'
import { useGetClinic } from '@/queries/clinic/get-clinic'
import { useGetSupplier } from '@/queries/suppliers/get-supplier'
import { useGetProducts } from '@/queries/products/get-products'
import { DatePicker } from "@/components/ui/datePicker"
import { Product } from '@/components/products'

// Item schema for the purchase order
const purchaseOrderItemSchema = z.object({
  productId: z.string().uuid("Please select a product"),
  quantityOrdered: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0.01, "Unit cost is required"),
  discount: z.number().default(0),
  totalCost: z.number().default(0),
  extendedAmount: z.number().default(0),
  unitsPerPackage: z.number().default(0),
  totalUnits: z.number().default(0)
})

// Main purchase order schema
const purchaseOrderSchema = z.object({
  clinicId: z.string().uuid("Please select a clinic"),
  supplierId: z.string().uuid("Please select a supplier"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  taxAmount: z.number().default(0),
  discount: z.number().default(0),
  notes: z.string().optional(),
  createdBy: z.string().uuid().optional(), // Will be set in onSubmit
  items: z.array(purchaseOrderItemSchema)
    .min(1, "At least one item is required")
    .refine(
      (items) => items.every(item => item.unitsPerPackage >= 0),
      {
        message: "Units per package must be a valid number",
        path: ["items"]
      }
    )
})

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
}

function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const { toast } = useToast()
  const { user } = useRootContext()
  
  // Get data for dropdowns
  const { data: clinicsData, isLoading: isLoadingClinics } = useGetClinic()
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useGetSupplier()
  const { data: productsData, isLoading: isLoadingProducts } = useGetProducts()

  // States for product search
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Create dropdown options
  const clinicOptions = clinicsData?.items?.map(clinic => ({
    value: clinic.id,
    label: clinic.name
  })) || []

  const supplierOptions = suppliersData?.items?.map(supplier => ({
    value: supplier.id,
    label: supplier.name
  })) || []

  // Form setup
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      clinicId: "",
      supplierId: "",
      expectedDeliveryDate: "",
      taxAmount: 0,
      discount: 0,
      notes: "",
      items: [
        {
          productId: "",
          quantityOrdered: 1,
          unitCost: 0,
          totalCost: 0,
          discount: 0,
          extendedAmount: 0,
          unitsPerPackage: 0,
          totalUnits: 0
        }
      ]
    },
    mode: "onChange"
  })

  // Create purchase order mutation
  const { mutate: createPurchaseOrder, isPending } = useCreatePurchaseOrder()
  
  // Product search handler
  const handleProductSearch = (query: string, index: number) => {
    setSearchQuery(query)
    setIsSearchDropdownOpen(true)
    
    if (!productsData?.items) return
    
    const filtered = productsData.items.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.genericName && product.genericName.toLowerCase().includes(query.toLowerCase())) ||
      (product.productNumber && product.productNumber.toLowerCase().includes(query.toLowerCase()))
    )
    
    setFilteredProducts(filtered)
  }

  // Product selection handler
  const handleProductSelect = (product: Product, index: number) => {
    // Set product ID
    form.setValue(`items.${index}.productId`, product.id)
    
    // Set unit cost from product price if available
    if (product.price) {
      form.setValue(`items.${index}.unitCost`, product.price)
    }
    
    setSearchQuery("")
    setIsSearchDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Form submission handler
  const onSubmit = (data: PurchaseOrderFormValues) => {
    // Convert date to ISO format
    const formattedExpectedDeliveryDate = new Date(data.expectedDeliveryDate).toISOString();
    
    // Get the current user's ID
    const userId = user?.id || getUserId();
    
    // Calculate totals for each item
    const itemsWithTotals = data.items.map(item => {
      const totalCost = (item.quantityOrdered * item.unitCost) - (item.discount || 0);
      
      // Find the selected product to get its UOM
      const selectedProduct = productsData?.items?.find(p => p.id === item.productId);
      const unitsPerPackage = item.unitsPerPackage || 0;
      const totalUnits = item.quantityOrdered * (unitsPerPackage || 1);
      
      return {
        purchaseOrderId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // This will be replaced by the server
        productId: item.productId,
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost,
        totalCost: totalCost,
        discount: item.discount || 0,
        extendedAmount: totalCost,
        unitsPerPackage: unitsPerPackage,
        totalUnits: totalUnits
      };
    });
    
    // Create the final purchase order data
    const purchaseOrderData = {
      clinicId: data.clinicId,
      supplierId: data.supplierId,
      expectedDeliveryDate: formattedExpectedDeliveryDate,
      status: "ordered", // Always set to "ordered" when creating
      taxAmount: data.taxAmount || 0,
      discount: data.discount || 0,
      notes: data.notes || "",
      createdBy: userId || "",
      items: itemsWithTotals
    };
    
    createPurchaseOrder(purchaseOrderData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Purchase order created successfully",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to create purchase order: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  }

  // Add item to the form
  const addItem = () => {
    const currentItems = form.getValues("items") || []
    form.setValue("items", [
      ...currentItems,
      {
        productId: "",
        quantityOrdered: 1,
        unitCost: 0,
        totalCost: 0,
        discount: 0,
        extendedAmount: 0,
        unitsPerPackage: 0,
        totalUnits: 0
      }
    ])
  }

  // Remove item from the form
  const removeItem = (index: number) => {
    const currentItems = form.getValues("items")
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index))
    } else {
      toast({
        title: "Error",
        description: "At least one item is required",
        variant: "destructive",
      })
    }
  }

  // Calculate order total
  const calculateOrderTotal = () => {
    const items = form.getValues("items") || []
    return items.reduce((total, item) => {
      const itemTotal = (item.quantityOrdered || 0) * (item.unitCost || 0) - (item.discount || 0)
      return total + itemTotal
    }, 0).toFixed(2)
  }

  // Handle quantity change to update total cost
  const handleQuantityChange = (index: number, value: number) => {
    form.setValue(`items.${index}.quantityOrdered`, value);
    
    // Recalculate totals
    const unitCost = form.getValues(`items.${index}.unitCost`) || 0;
    const discount = form.getValues(`items.${index}.discount`) || 0;
    const totalCost = value * unitCost - discount;
    
    form.setValue(`items.${index}.totalCost`, totalCost);
    form.setValue(`items.${index}.extendedAmount`, totalCost);
  }

  // Get product details by ID
  const getProductById = (productId: string): Product | undefined => {
    return productsData?.items?.find(product => product.id === productId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Purchase Order</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Order Information Section */}
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-4">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="clinicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={clinicOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select clinic"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <FormControl>
                        <Combobox
                          options={supplierOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select supplier"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date *</FormLabel>
                      <FormControl>
                        <DatePicker 
                          value={field.value ? new Date(field.value) : null}
                          onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Order Items Section */}
            <div className="bg-slate-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">Order Items</h3>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 mb-2 px-2">
                <div className="col-span-3 text-sm font-medium">Product *</div>
                <div className="col-span-2 text-sm font-medium">UOM</div>
                <div className="col-span-1 text-sm font-medium">Qty *</div>
                <div className="col-span-2 text-sm font-medium">Unit Cost *</div>
                <div className="col-span-2 text-sm font-medium">Discount</div>
                <div className="col-span-1 text-sm font-medium">Units/Pkg</div>
                <div className="col-span-1"></div>
              </div>

              {/* Item rows */}
              {form.watch("items").map((item, index) => {
                // Get product details if selected
                const selectedProduct = item.productId ? getProductById(item.productId) : null;
                
                return (
                  <div key={index} className={cn("grid grid-cols-12 gap-2 mb-4 items-center", index > 0 ? "mt-2" : "")}>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                  <Input
                                    type="text"
                                    placeholder="Search product..."
                                    className="pl-10"
                                    value={field.value ? (selectedProduct?.name || "") : searchQuery}
                                    onChange={(e) => {
                                      if (!field.value) {
                                        handleProductSearch(e.target.value, index);
                                      }
                                    }}
                                    onFocus={() => {
                                      if (!field.value) {
                                        setIsSearchDropdownOpen(true);
                                      }
                                    }}
                                  />
                                </div>
                                
                                {/* Search results dropdown */}
                                {isSearchDropdownOpen && !field.value && (
                                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {filteredProducts.length > 0 ? (
                                      filteredProducts.map((product) => (
                                        <div
                                          key={product.id}
                                          className="relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-slate-100"
                                          onClick={() => handleProductSelect(product, index)}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">{product.name}</span>
                                            <span className="text-sm text-gray-500">
                                              {product.productNumber} | {product.unitOfMeasure} | ${product.price?.toFixed(2) || "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700">
                                        {searchQuery.trim() === "" ? "Type to search products" : "No products found"}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Display UOM from selected product */}
                    <div className="col-span-2">
                      <div className="text-sm py-2 px-3 border border-input bg-background rounded-md">
                        {selectedProduct?.unitOfMeasure || "N/A"}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantityOrdered`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field} 
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  handleQuantityChange(index, value);
                                }} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitCost`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <div className="text-sm py-2 px-3 border border-input bg-background rounded-md">
                                ${field.value ? field.value.toFixed(2) : '0.00'}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitsPerPackage`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={form.watch("items").length <= 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Order Total: ${calculateOrderTotal()}</div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes or instructions for this order" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4 border-t gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="theme-button text-white" disabled={isPending}>
                {isPending ? "Creating..." : "Create Purchase Order"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export { OrderModal } 