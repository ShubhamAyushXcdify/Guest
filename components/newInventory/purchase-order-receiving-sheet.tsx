"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGetPurchaseOrderById } from "@/queries/purchaseOrder/get-purchaseOrder-by-id";
import { useReceivePurchaseOrderReceiving } from "@/queries/purchaseOrderReceiving/receive-purchaseOrderReceiving";
import { useForm, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUserId } from "@/utils/clientCookie";
import { toast } from "@/components/ui/use-toast";
import { DatePicker } from "@/components/ui/datePicker";
import { Plus, Trash2 } from "lucide-react";

// 1. Define a schema for the form data with batch support
const formSchema = z.object({
  purchaseOrderId: z.string(),
  notes: z.string().optional(),
  receivedItems: z.array(
    z.object({
      purchaseOrderItemId: z.string(),
      productId: z.string(),
      batches: z.array(
        z.object({
          quantityReceived: z.number().min(0),
          batchNumber: z.string().min(1, "Batch number is required"),
          expiryDate: z
            .string()
            .optional()
            .refine(
              (val) => {
                if (!val) return true;
                const today = new Date().setHours(0, 0, 0, 0);
                const selected = new Date(val).setHours(0, 0, 0, 0);
                return selected >= today;
              },
              { message: "Expiry date cannot be in the past" }
            ),
          dateOfManufacture: z
            .string()
            .optional()
            .refine(
              (val) => {
                if (!val) return true;
                const today = new Date().setHours(0, 0, 0, 0);
                const selected = new Date(val).setHours(0, 0, 0, 0);
                return selected <= today;
              },
              { message: "Manufacturing date cannot be in the future" }
            ),
          notes: z.string().optional(),
        })
      ).min(1, "At least one batch is required"),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;



export function PurchaseOrderReceivingSheet({ isOpen, onClose, purchaseOrderId }: {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId: string | null;
}) {
  const { data: order, isLoading } = useGetPurchaseOrderById(purchaseOrderId || "", !!purchaseOrderId);
  const { mutate: receiveOrder, isPending } = useReceivePurchaseOrderReceiving();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { purchaseOrderId: "", notes: "", receivedItems: [] },
  });

  useEffect(() => {
    if (order) {
      form.reset({
        purchaseOrderId: order.id,
        notes: "",
        receivedItems: order.items.map((item: any) => {
          const ordered = item.quantityOrdered ?? 0;
          const alreadyReceived = item.quantityReceived ?? 0;
          const maxReceivable = Math.max(ordered - alreadyReceived, 0);
          return {
            purchaseOrderItemId: item.id,
            productId: item.productId,
            batches: [
              {
                quantityReceived: maxReceivable, // Set default to max receivable
                batchNumber: "",
                expiryDate: "",
                dateOfManufacture: "",
                notes: "",
              }
            ],
          };
        }),
      });
    }
  }, [order, form]);

  const onSubmit = (data: FormValues) => {
    // Filter out items that have at least one batch with quantity > 0
    const filteredItems = data.receivedItems.filter(item =>
      item.batches.some(batch => batch.quantityReceived > 0)
    ).map(item => ({
      ...item,
      batches: item.batches.filter(batch => batch.quantityReceived > 0)
    }));

    if (filteredItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter quantity for at least one batch",
        variant: "destructive"
      });
      return;
    }

    // Get user ID from client cookie
    const currentUserId = getUserId() || "system";

    receiveOrder(
      {
        purchaseOrderId: data.purchaseOrderId,
        notes: data.notes || "",
        receivedBy: currentUserId,
        receivedItems: filteredItems.map(item => ({
          purchaseOrderItemId: item.purchaseOrderItemId,
          productId: item.productId,
          batches: item.batches.map(batch => ({
            quantityReceived: Number(batch.quantityReceived),
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString() : undefined,
            dateOfManufacture: batch.dateOfManufacture ? new Date(batch.dateOfManufacture).toISOString() : undefined,
            notes: batch.notes || "",
          })),
        })),
      },
      {
        onSuccess: () => {
          onClose();
          toast({
            title: "Success",
            description: "Order received successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to receive order: ${error.message}`,
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90%] sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Receive Purchase Order</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div>Loading...</div>
        ) : order ? (
          <>
            {/* Purchase Order Info */}
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">PO Number:</span> {order.orderNumber}
              </div>
              <div>
                <span className="font-medium">Supplier:</span> {order.supplier?.name || 'N/A'}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {/* Items with Batches */}
              <div className="bg-slate-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold">Receiving Items</h3>
                </div>

                {/* Single Header Row for All Products */}
                <div className="grid grid-cols-8 gap-2 mb-2 px-2 text-sm font-medium text-gray-700 bg-gray-100 py-2 rounded">
                  <div className="col-span-1">Product</div>
                  <div className="col-span-1">Ordered</div>
                  <div className="col-span-1">Qty Receiving</div>
                  <div className="col-span-1">Batch #</div>
                  <div className="col-span-1">Expiry Date</div>
                  <div className="col-span-1">Mfg Date</div>
                  <div className="col-span-1">Notes</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {form.watch("receivedItems")?.map((receivedItem, itemIdx) => {
                  const orderItem = order.items[itemIdx];
                  const ordered = orderItem?.quantityOrdered ?? 0;
                  const alreadyReceived = orderItem?.quantityReceived ?? 0;
                  const maxReceivable = Math.max(ordered - alreadyReceived, 0);

                  return (
                    <div key={itemIdx} className="mb-4">

                      {/* Batches for this item */}
                      {receivedItem.batches.map((_, batchIdx) => (
                        <div key={batchIdx} className="grid grid-cols-8 gap-2 mb-2 items-center px-2">
                          {/* Product Name - Only show for first batch */}
                          <div className="col-span-1">
                            {batchIdx === 0 ? (
                              <div className="text-sm py-2 px-3 border border-input bg-background rounded-md">
                                {orderItem?.product?.name}
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>

                          {/* Ordered Quantity - Only show for first batch */}
                          <div className="col-span-1">
                            {batchIdx === 0 ? (
                              <div className="text-sm py-2 px-3 border border-input bg-background rounded-md">
                                {ordered}
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </div>

                          {/* Quantity Received */}
                          <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name={`receivedItems.${itemIdx}.batches.${batchIdx}.quantityReceived`}
                              render={({ field }) => {
                                // Calculate remaining quantity available for this batch
                                const otherBatchesTotal = form.getValues(`receivedItems.${itemIdx}.batches`)
                                  .reduce((sum: number, batch: any, idx: number) => {
                                    if (idx !== batchIdx) {
                                      return sum + (batch.quantityReceived || 0);
                                    }
                                    return sum;
                                  }, 0);
                                const maxForThisBatch = Math.max(0, maxReceivable - otherBatchesTotal);

                                return (
                                  <FormItem className="mb-0">
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="0"
                                        max={maxForThisBatch}
                                        {...field}
                                        onChange={e => {
                                          let val = Number(e.target.value);
                                          // Prevent exceeding the maximum allowed for this batch
                                          if (val > maxForThisBatch) {
                                            val = maxForThisBatch;
                                          }
                                          if (val < 0) {
                                            val = 0;
                                          }
                                          field.onChange(val);
                                        }}
                                        onBlur={e => {
                                          let val = Number(e.target.value);
                                          // Ensure value doesn't exceed max on blur as well
                                          if (val > maxForThisBatch) {
                                            val = maxForThisBatch;
                                            field.onChange(val);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>

                          {/* Batch Number */}
                          <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name={`receivedItems.${itemIdx}.batches.${batchIdx}.batchNumber`}
                              render={({ field }) => (
                                <FormItem className="mb-0">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Expiry Date */}
                          <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name={`receivedItems.${itemIdx}.batches.${batchIdx}.expiryDate`}
                              render={({ field }) => (
                                <FormItem className="mb-0">
                                  <FormControl>
                                    <DatePicker
                                      value={field.value ? new Date(field.value) : null}
                                      onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                      placeholder="Select expiry date"
                                      minDate={new Date()}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Manufacturing Date */}
                          <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name={`receivedItems.${itemIdx}.batches.${batchIdx}.dateOfManufacture`}
                              render={({ field }) => (
                                <FormItem className="mb-0">
                                  <FormControl>
                                    <DatePicker
                                      value={field.value ? new Date(field.value) : null}
                                      onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                      placeholder="Select mfg date"
                                      maxDate={new Date()}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Notes */}
                          <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name={`receivedItems.${itemIdx}.batches.${batchIdx}.notes`}
                              render={({ field }) => (
                                <FormItem className="mb-0">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Actions */}
                          <div className="col-span-1">
                            {batchIdx === 0 ? (
                              // First row: ALWAYS show "+" button
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentBatches = form.getValues(`receivedItems.${itemIdx}.batches`);
                                  const newBatch = {
                                    quantityReceived: 0,
                                    batchNumber: "",
                                    expiryDate: "",
                                    dateOfManufacture: "",
                                    notes: "",
                                  };
                                  form.setValue(`receivedItems.${itemIdx}.batches`, [...currentBatches, newBatch]);
                                }}
                                className="w-8 h-8 p-0 flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            ) : (
                              // Additional rows: Show delete button
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentBatches = form.getValues(`receivedItems.${itemIdx}.batches`);
                                  if (currentBatches.length > 1) {
                                    const newBatches = currentBatches.filter((_, idx) => idx !== batchIdx);
                                    form.setValue(`receivedItems.${itemIdx}.batches`, newBatches);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Received Items Table */}
                {order.receivedItems && order.receivedItems.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold mb-2 text-slate-700">Received Batches</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-xs bg-white rounded shadow table-fixed" style={{ tableLayout: 'fixed', width: '100%' }}>
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Batch #</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Product</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Qty Received</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Expiry Date</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Mfg Date</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Notes</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Received By</th>
                            <th className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>Received Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.receivedItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.batchNumber}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.productName}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.quantityReceived}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : ""}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.dateOfManufacture ? new Date(item.dateOfManufacture).toLocaleDateString() : ""}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.notes}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.receivedByName}</td>
                              <td className="px-2 py-1 border text-center align-middle" style={{textAlign:'center', verticalAlign:'middle'}}>{item.receivedDate ? new Date(item.receivedDate).toLocaleDateString() : ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Notes Section (for the whole receipt) */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes for this receipt" className="min-h-[80px]" {...field} />
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
                  {isPending ? "Receiving..." : "Receive"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
          </>
        ) : (
          <div>No order found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
} 