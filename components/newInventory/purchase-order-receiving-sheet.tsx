"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGetPurchaseOrderById } from "@/queries/purchaseOrder/get-purchaseOrder-by-id";
import { useReceivePurchaseOrderReceiving } from "@/queries/purchaseOrderReceiving/receive-purchaseOrderReceiving";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getUserId } from "@/utils/clientCookie";
import { toast } from "@/components/ui/use-toast";
import { DatePicker } from "@/components/ui/datePicker";

// 1. Define a schema for the form data
const formSchema = z.object({
  purchaseOrderId: z.string(),
  notes: z.string().optional(),
  receivedItems: z.array(
    z.object({
      purchaseOrderItemId: z.string(),
      quantityReceived: z.number().min(0),
      batchNumber: z.string(),
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
            quantityReceived: maxReceivable, // Set default to max receivable
            batchNumber: "",
            expiryDate: "",
            dateOfManufacture: "",
            notes: "",
          };
        }),
      });
    }
  }, [order, form]);

  const onSubmit = (data: FormValues) => {
    // Filter out items with zero quantity received
    const filteredItems = data.receivedItems.filter(item => item.quantityReceived > 0);

    if (filteredItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter quantity for at least one item",
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
          productId: order?.items.find(orderItem => orderItem.id === item.purchaseOrderItemId)?.productId || "",
          quantityReceived: Number(item.quantityReceived),
          batchNumber: item.batchNumber || "",
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : undefined,
          dateOfManufacture: item.dateOfManufacture ? new Date(item.dateOfManufacture).toISOString() : undefined,
          notes: item.notes || "",
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {/* Items Table */}
              <div className="bg-slate-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold">Receiving Items</h3>
                </div>
                {/* Table header */}
                <div className="grid grid-cols-8 gap-2 mb-2 px-2">
                  <div className="col-span-2 text-sm font-medium">Product</div>
                  <div className="col-span-1 text-sm font-medium">Ordered</div>
                  <div className="col-span-1 text-sm font-medium">Qty Receiving</div>
                  <div className="col-span-1 text-sm font-medium">Batch #</div>
                  <div className="col-span-1 text-sm font-medium">Expiry Date</div>
                  <div className="col-span-1 text-sm font-medium">Mfg Date</div>
                  <div className="col-span-1 text-sm font-medium">Notes</div>
                </div>
                {/* Item rows */}
                {form.watch("receivedItems")?.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-8 gap-2 mb-2 items-center px-2">
                    <div className="col-span-2">
                      <div className="text-sm py-2 px-3 border border-input bg-background rounded-md">
                        {order.items[idx]?.product?.name}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm py-2 px-3 border border-input bg-background rounded-md">
                        {order.items[idx]?.quantityOrdered}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`receivedItems.${idx}.quantityReceived`}
                        render={({ field }) => {
                          const ordered = order.items[idx]?.quantityOrdered ?? 0;
                          const alreadyReceived = order.items[idx]?.quantityReceived ?? 0;
                          const maxReceivable = Math.max(ordered - alreadyReceived, 0);
                          return (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max={maxReceivable}
                                  {...field}
                                  onChange={e => {
                                    let val = Number(e.target.value);
                                    if (val > maxReceivable) val = maxReceivable;
                                    field.onChange(val);
                                  }}
                                />
                              </FormControl>
                             
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`receivedItems.${idx}.batchNumber`}
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
                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`receivedItems.${idx}.expiryDate`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <DatePicker
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                placeholder="Select expiry date"
                                minDate={new Date()} // Disables past dates
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
                        name={`receivedItems.${idx}.dateOfManufacture`}
                        render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <DatePicker
                                value={field.value ? new Date(field.value) : null}
                                onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                placeholder="Select mfg date"
                                maxDate={new Date()} // Disables future dates
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
                        name={`receivedItems.${idx}.notes`}
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
                  </div>
                ))}
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
              </div>
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
        ) : (
          <div>No order found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
} 