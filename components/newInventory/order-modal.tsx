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
import { useGetSupplier } from '@/queries/suppliers/get-supplier'
import { useGetProducts } from '@/queries/products/get-products'
import { DatePicker } from "@/components/ui/datePicker"
import { Product } from '@/components/products'

// Item schema for the purchase order
const purchaseOrderItemSchema = z.object({
  productId: z.string().uuid("Please select a product"),
  quantityOrdered: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0.01, "Unit cost is required"),
  discountPercentage: z.number().min(0).max(100).default(0),
  discountedAmount: z.number().min(0).default(0),
  extendedAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0)
})

// Main purchase order schema
const purchaseOrderSchema = z.object({
  supplierId: z.string().uuid("Please select a supplier"),
  expectedDeliveryDate: z.string()
    .min(1, "Expected delivery date is required")
    .refine((date) => {
      // Check if date is valid and in the future
      const parsedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return !isNaN(parsedDate.getTime()) && parsedDate >= today;
    }, "Expected delivery date must be today or in the future"),
  status: z.string().default("ordered"),
  discountPercentage: z.number().min(0).max(100).default(0),
  discountedAmount: z.number().min(0).default(0),
  extendedAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  notes: z.string().default("")
})

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>
type PurchaseOrderItemValues = z.infer<typeof purchaseOrderItemSchema>

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  clinicId: string
  initialProductId?: string
}

function OrderModal({ isOpen, onClose, clinicId, initialProductId }: OrderModalProps) {
  const { toast } = useToast()
  const { user } = useRootContext()
  
  // States
  const [items, setItems] = useState<PurchaseOrderItemValues[]>([{
    productId: initialProductId || "",
    quantityOrdered: 1,
    unitCost: 0,
    discountPercentage: 0,
    discountedAmount: 0,
    extendedAmount: 0,
    taxAmount: 0,
    totalAmount: 0
  }])
  
  React.useEffect(() => {
    if (isOpen) {
      setItems([{
        productId: initialProductId || "",
        quantityOrdered: 1,
        unitCost: 0,
        discountPercentage: 0,
        discountedAmount: 0,
        extendedAmount: 0,
        taxAmount: 0,
        totalAmount: 0
      }]);
      form.reset({
        supplierId: "",
        expectedDeliveryDate: "",
        status: "ordered",
        discountPercentage: 0,
        discountedAmount: 0,
        extendedAmount: 0,
        totalAmount: 0,
        notes: ""
      });
  
      setFormSubmitted(false);
      setSearchQuery("");
    }
  }, [isOpen, initialProductId]);

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Get data for dropdowns
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useGetSupplier(1, 100, '', clinicId, true)
  const { data: productsData, isLoading: isLoadingProducts } = useGetProducts(1, 100, {
    searchByname: null,
    category: null, 
    productType: null
  }, true)

  // Effect to debug products data
  useEffect(() => {
    if (productsData) {
      console.log("Products data loaded:", {
        totalCount: productsData.totalCount,
        itemsLength: productsData.items?.length || 0
      });
      
      // Show first 3 products for debugging
      if (productsData.items?.length > 0) {
        console.log("Sample products:", productsData.items.slice(0, 3).map(p => ({ 
          id: p.id, 
          name: p.name,
          productNumber: p.productNumber 
        })));
      }
    }
  }, [productsData]);
  
  // Try to load some products when clicked if products aren't already loaded
  const triggerProductsLoad = () => {
    if (!productsData?.items || productsData.items.length === 0) {
      // If we have products data but no items, log the issue
      console.log("Attempting to load products manually");
      
      // Set some filtered products for testing if available
      if (productsData?.items) {
        setFilteredProducts(productsData.items.slice(0, 10));
      }
    }
  };

  // Create dropdown options
  const supplierOptions = suppliersData?.items?.map(supplier => ({
    value: supplier.id,
    label: supplier.name
  })) || []

  // Form setup
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: "",
      expectedDeliveryDate: "",
      status: "ordered",
      discountPercentage: 0,
      discountedAmount: 0,
          extendedAmount: 0,
      totalAmount: 0,
      notes: ""
    },
    mode: "onChange"
  })

  // Create purchase order mutation
  const { mutate: createPurchaseOrder, isPending } = useCreatePurchaseOrder()
  
  // Product search handler
  const handleProductSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setFilteredProducts([])
      return
    }
    
    setIsSearchDropdownOpen(true)
    
    if (!productsData?.items) {
      console.log("No products data available:", productsData);
      return;
    }

    console.log("Products data:", productsData.items.length, "items found");
    
    const filtered = productsData.items.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.genericName && product.genericName.toLowerCase().includes(query.toLowerCase())) ||
      (product.productNumber && product.productNumber.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 10)  // Limit to 10 results for better performance
    
    console.log("Filtered products:", filtered.length, "items match search criteria");
    setFilteredProducts(filtered)
  }

  // Fix date handling for expected delivery date
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      form.setValue("expectedDeliveryDate", "");
      return;
    }
    
    // Fix timezone issue by using local date string in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
  
    
    form.setValue("expectedDeliveryDate", formattedDate);
  };

  // Product selection handler
  const handleProductSelect = (product: Product, index: number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      productId: product.id,
      unitCost: product.price || 0
    }
    
    setItems(updatedItems)
    setSearchQuery("")
    setIsSearchDropdownOpen(false)
    calculateItemValues(updatedItems, index)
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

  // Calculate item values
  const calculateItemValues = (itemsArray: PurchaseOrderItemValues[], index: number) => {
    const item = itemsArray[index]
    const quantityOrdered = item.quantityOrdered || 0
    const unitCost = item.unitCost || 0
    const discountPercentage = item.discountPercentage || 0
    const taxAmount = item.taxAmount || 0 // Preserve manually entered tax amount
    
    const subtotal = quantityOrdered * unitCost
    const discountedAmount = (subtotal * discountPercentage) / 100
    const extendedAmount = subtotal - discountedAmount
    // Keep the manually entered tax amount
    const totalAmount = extendedAmount + taxAmount
    
    const updatedItems = [...itemsArray]
    updatedItems[index] = {
      ...updatedItems[index],
      discountedAmount,
      extendedAmount,
      // Don't overwrite manually entered taxAmount
      totalAmount
    }
    
    setItems(updatedItems)
    calculateOrderTotals(updatedItems)
  }
  
  // Calculate order totals
  const calculateOrderTotals = (itemsArray: PurchaseOrderItemValues[]) => {
    let subtotal = 0
    let totalTaxAmount = 0
    
    itemsArray.forEach(item => {
      subtotal += item.extendedAmount
      totalTaxAmount += item.taxAmount || 0
    })
    
    // Apply order-level discount
    const discountPercentage = form.watch("discountPercentage") || 0
    const discountedAmount = (subtotal * discountPercentage) / 100
    const extendedAmount = subtotal - discountedAmount
    const totalAmount = extendedAmount + totalTaxAmount
    
    form.setValue("discountedAmount", discountedAmount)
    form.setValue("extendedAmount", extendedAmount)
    form.setValue("totalAmount", totalAmount)
  }

  // Add new item
  const addItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantityOrdered: 1,
        unitCost: 0,
        discountPercentage: 0,
        discountedAmount: 0,
        extendedAmount: 0,
        taxAmount: 0,
        totalAmount: 0
      }
    ])
  }

  // Remove item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index)
      setItems(updatedItems)
      calculateOrderTotals(updatedItems)
    } else {
      toast({
        title: "Error",
        description: "At least one item is required",
        variant: "destructive"
      })
    }
  }

  // Handle input changes
  const handleQuantityChange = (index: number, value: number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      quantityOrdered: value
    }
    setItems(updatedItems)
    calculateItemValues(updatedItems, index)
  }

  const handleDiscountPercentageChange = (index: number, value: number) => {
    const updatedItems = [...items]
    updatedItems[index] = {
      ...updatedItems[index],
      discountPercentage: value
    }
    setItems(updatedItems)
    calculateItemValues(updatedItems, index)
  }

  const handleOrderDiscountPercentageChange = (value: number) => {
    form.setValue("discountPercentage", value)
    calculateOrderTotals(items)
  }

  // Form submission handler
  const onSubmit = (data: PurchaseOrderFormValues) => {
    setFormSubmitted(true)
    
    // Validate items
    let hasInvalidItems = false
    items.forEach((item, index) => {
      if (!item.productId) {
        hasInvalidItems = true
      }
    })
    
    if (hasInvalidItems) {
      toast({
        title: "Error",
        description: "Please select products for all items",
        variant: "destructive"
      })
      return
    }
    
    // Format date for API submission
    let formattedExpectedDeliveryDate = data.expectedDeliveryDate;
    try {
      // Create a date object using the YYYY-MM-DD format
      const dateParts = data.expectedDeliveryDate.split('-');
      const dateObj = new Date(
        parseInt(dateParts[0]),     // year
        parseInt(dateParts[1]) - 1, // month (0-indexed)
        parseInt(dateParts[2])      // day
      );
      // Format as ISO string for API
      formattedExpectedDeliveryDate = dateObj.toISOString();
      console.log("Formatted delivery date:", formattedExpectedDeliveryDate);
    } catch (error) {
      console.error("Date formatting error:", error);
      // Fall back to original string if there's an error
    }
    
    // Get user ID
    const userId = user?.id || getUserId()
    
    // Create final order items with purchaseOrderId placeholder
    const orderItems = items.map(item => ({
      purchaseOrderId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Will be replaced by server
      productId: item.productId,
      quantityOrdered: item.quantityOrdered,
      unitCost: item.unitCost,
      discountPercentage: item.discountPercentage,
      discountedAmount: item.discountedAmount,
      extendedAmount: item.extendedAmount,
      taxAmount: item.taxAmount,
      totalAmount: item.totalAmount,
      unitsPerPackage: 0, // As requested, not used in UI but sent as 0
      totalUnits: 0 // As requested, not used in UI but sent as 0
    }))
    
    // Create purchase order payload
    const purchaseOrderData = {
      clinicId: clinicId,
      supplierId: data.supplierId,
      expectedDeliveryDate: formattedExpectedDeliveryDate,
      status: "ordered", // Default value
      discountPercentage: data.discountPercentage,
      discountedAmount: data.discountedAmount,
      extendedAmount: data.extendedAmount,
      totalAmount: data.totalAmount,
      notes: data.notes,
      createdBy: userId || "",
      items: orderItems
    }
    
    // Submit purchase order
    createPurchaseOrder(purchaseOrderData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Purchase order created successfully"
        })
        onClose()
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to create purchase order: ${error.message}`,
          variant: "destructive"
        })
      }
    })
  }

  // Get product details by ID
  const getProductById = (productId: string): Product | undefined => {
    return productsData?.items?.find(product => product.id === productId)
  }
  
  // Check if any item has validation error
  const hasProductErrors = (index: number) => {
    return formSubmitted && !items[index].productId
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                  control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                      <FormLabel>Supplier <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Combobox
                              options={supplierOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                          placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select supplier"}
                            />
                          </FormControl>
                      {formSubmitted && <FormMessage />}
                        </FormItem>
                      )}
                    />

                    <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem>
                      <FormLabel>Expected Delivery Date <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                        <DatePicker 
                          value={field.value ? new Date(field.value) : null}
                          onChange={handleDateChange}
                          minDate={(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0); // Reset time to start of day
                            return today;
                          })()} // Set minimum date to today at 00:00:00
                        />
                          </FormControl>
                      {formSubmitted && <FormMessage />}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Discount (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0.00"
                              value={field.value}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handleOrderDiscountPercentageChange(value)
                              }}
                            />
                          </FormControl>
                          {formSubmitted && <FormMessage />}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountedAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              readOnly
                              value={field.value.toFixed(2)}
                              className="bg-gray-50"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                  control={form.control}
                  name="notes"
                      render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes</FormLabel>
                          <FormControl>
                        <Textarea
                          placeholder="Enter notes for this order"
                          value={field.value}
                          onChange={field.onChange}
                          className="min-h-20"
                        />
                          </FormControl>
                      {formSubmitted && <FormMessage />}
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

              {/* Table layout */}
              <div className="w-full">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 mb-4 border-b pb-2 font-medium text-sm">
                  <div className="col-span-3">Product <span className="text-red-500">*</span></div>
                  <div className="col-span-1">UOM</div>
                  <div className="col-span-1">Quantity <span className="text-red-500">*</span></div>
                  <div className="col-span-1">Unit Cost <span className="text-red-500">*</span></div>
                  <div className="col-span-1">Discount %</div>
                  <div className="col-span-1">Disc. Amount</div>
                  <div className="col-span-1">Extended</div>
                  <div className="col-span-1">Tax</div>
                  <div className="col-span-1">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Item rows */}
                {items.map((item, index) => {
                  const selectedProduct = item.productId ? getProductById(item.productId) : null
                
                return (
                  <div key={index} className={cn("grid grid-cols-12 gap-2 mb-4 items-center", index > 0 ? "mt-2" : "")}>
                      {/* Product Search */}
                    <div className="col-span-3">
                              <div className="relative" ref={dropdownRef}>
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                  <Input
                                    type="text"
                              placeholder="Search by name or code..."
                              className={cn(
                                "pl-10",
                                hasProductErrors(index) && "border-red-500 focus-visible:ring-red-500"
                              )}
                              value={item.productId ? (selectedProduct?.name || "") : (activeItemIndex === index ? searchQuery : "")}
                                    onChange={(e) => {
                                if (!item.productId) {
                                  setActiveItemIndex(index)
                                  handleProductSearch(e.target.value)
                                } else {
                                  // Clear the product selection when user starts typing
                                  const updatedItems = [...items];
                                  updatedItems[index] = {
                                    ...updatedItems[index],
                                    productId: ""
                                  };
                                  setItems(updatedItems);
                                  setActiveItemIndex(index);
                                  handleProductSearch(e.target.value);
                                }
                                    }}
                                    onFocus={() => {
                                if (!item.productId) {
                                  setActiveItemIndex(index)
                                  triggerProductsLoad(); // Try to load products on focus
                                        setIsSearchDropdownOpen(true);
                                      }
                                    }}
                                  />
                                </div>
                                
                                {/* Search results dropdown */}
                          {isSearchDropdownOpen && activeItemIndex === index && !item.productId && (
                                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {isLoadingProducts ? (
                                <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700">
                                  Loading products...
                                </div>
                              ) : filteredProducts.length > 0 ? (
                                      filteredProducts.map((product) => (
                                        <div
                                          key={product.id}
                                    className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-slate-100"
                                          onClick={() => handleProductSelect(product, index)}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">{product.name}</span>
                                            <span className="text-sm text-gray-500">
                                        {product.productNumber || ''} {product.unitOfMeasure ? `| ${product.unitOfMeasure}` : ''} {product.price ? `| ₹${product.price.toFixed(2)}` : ''}
                                            </span>
                                          </div>
                                        </div>
                                      ))
                              ) : searchQuery ? (
                                      <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700">
                                  No products found
                                      </div>
                              ) : null}
                                  </div>
                                )}
                              </div>
                        {hasProductErrors(index) && (
                          <div className="text-xs text-red-500 mt-1">Please select a product</div>
                        )}
                    </div>

                      {/* UOM */}
                      <div className="col-span-1">
                        <div className="text-sm py-2 px-2 border border-input bg-background rounded-md truncate">
                        {selectedProduct?.unitOfMeasure || "N/A"}
                      </div>
                    </div>

                      {/* Quantity */}
                    <div className="col-span-1">
                              <Input 
                                type="number" 
                                min="1" 
                          value={item.quantityOrdered}
                                onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            handleQuantityChange(index, value)
                                }} 
                      />
                    </div>

                      {/* Unit Cost */}
                      <div className="col-span-1">
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            const updatedItems = [...items]
                            updatedItems[index] = {
                              ...updatedItems[index],
                              unitCost: value
                            }
                            setItems(updatedItems)
                            calculateItemValues(updatedItems, index)
                          }}
                      />
                    </div>

                      {/* Discount Percentage */}
                      <div className="col-span-1">
                              <Input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                          max="100"
                          value={item.discountPercentage}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            handleDiscountPercentageChange(index, value)
                          }}
                              />
                      </div>

                      {/* Discounted Amount */}
                      <div className="col-span-1">
                        <Input
                          readOnly
                          value={item.discountedAmount.toFixed(2)}
                          className="bg-gray-50"
                      />
                    </div>

                      {/* Extended Amount */}
                    <div className="col-span-1">
                              <Input
                          readOnly
                          value={item.extendedAmount.toFixed(2)}
                          className="bg-gray-50"
                              />
                      </div>
                      
                      {/* Tax Amount */}
                      <div className="col-span-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.taxAmount}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            const updatedItems = [...items]
                            updatedItems[index] = {
                              ...updatedItems[index],
                              taxAmount: value
                            }
                            setItems(updatedItems)
                            calculateItemValues(updatedItems, index)
                          }}
                              />
                      </div>

                      {/* Total Amount */}
                      <div className="col-span-1">
                        <Input
                          readOnly
                          value={item.totalAmount.toFixed(2)}
                          className="bg-gray-50 font-medium"
                    />
                  </div>

                      {/* Remove Button */}
                      <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                          disabled={items.length <= 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                  )
              })}

                {/* Add Item Button */}
                <div className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addItem}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
                </div>

                {/* Order Totals */}
                <div className="flex justify-end mt-6">
                  <div className="w-1/3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Subtotal:</span>
                      <span>₹{items.reduce((total, item) => total + item.extendedAmount, 0).toFixed(2)}</span>
                    </div>
                    
                    {/* Order-level discount */}
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Order Discount:</span>
                      <span>-₹{form.watch("discountedAmount").toFixed(2)} ({form.watch("discountPercentage")}%)</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Subtotal after discount:</span>
                      <span>₹{form.watch("extendedAmount").toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Tax:</span>
                      <span>₹{items.reduce((total, item) => total + (item.taxAmount || 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-base font-medium">Total:</span>
                      <span className="text-base font-medium">₹{form.watch("totalAmount").toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
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