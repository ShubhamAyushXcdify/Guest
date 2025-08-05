'use client';

import { useState, useEffect } from "react";
import { useGetProductById } from "@/queries/products/get-product-by-id";
import { useUpdateProduct } from "@/queries/products/update-product";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";
import { Product } from ".";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Combobox } from "../ui/combobox";

// const PRODUCT_TYPES = ["medication", "vaccine", "supply", "food", "supplement"];
const PRODUCT_TYPES = [
  { value: "medication", label: "Medication" },
  { value: "vaccine", label: "Vaccine" },
  { value: "supply", label: "Medical Supply" },
  { value: "food", label: "Food Item" },
  { value: "supplement", label: "Supplement" }
];

const UNIT_OF_MEASURE_OPTIONS = [
  { value: "EA", label: "Each (EA)" },
  { value: "BOTTLE", label: "Bottle" },
  { value: "BOX", label: "Box" }
];

const PRODUCT_CATEGORIES = [
  { value: "antibiotics", label: "Antibiotics" },
  { value: "pain_management", label: "Pain Management" },
  { value: "vaccines", label: "Vaccines" },
  { value: "supplements", label: "Supplements" },
  { value: "medical_supplies", label: "Medical Supplies" },
  { value: "equipment", label: "Equipment" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" }
];

interface ProductDetailsProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ProductDetails({ productId, onSuccess }: ProductDetailsProps) {
  const router = useRouter();
  const [isFormReady, setIsFormReady] = useState(false);

  const { data: product, isLoading } = useGetProductById(productId);

  console.log("Product Details Data:", product);

  const updateProduct = useUpdateProduct();

  // Don't initialize the form until we have product data
  const form = useForm<Product>();

  // Update form values when product data is loaded
  useEffect(() => {
    if (product && !isFormReady) {
      const formData = {
        ...product,
        productType: product.productType || '',
        unitOfMeasure: product.unitOfMeasure || '',
        price: product.price ?? 0,
        reorderThreshold: product.reorderThreshold ?? null,
        category: product.category || '',
        requiresPrescription: product.requiresPrescription ?? false,
        isActive: product.isActive ?? true,
        productNumber: product.productNumber || '',
        name: product.name || '',
        genericName: product.genericName || '',
        ndcNumber: product.ndcNumber || '',
        dosageForm: product.dosageForm || '',
        controlledSubstanceSchedule: product.controlledSubstanceSchedule || '',
        storageRequirements: product.storageRequirements || '',
      };
      
      form.reset(formData);
      setIsFormReady(true);
    }
  }, [product, form, isFormReady]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  // Don't render the form until it's ready with data
  if (!isFormReady) {
    return <div>Preparing form...</div>;
  }

  const handleSubmit = async (values: Product) => {
    try {
      await updateProduct.mutateAsync(values);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      if (onSuccess) onSuccess();
      // Refetch product data after update to ensure UI is up to date
      form.reset(values);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  console.log("Product Details Form Values:", form.getValues());

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto pb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col w-full h-full">
          <div className="flex-1 pb-4">
          <div className="grid grid-cols-2 gap-8">

            <FormField name="productNumber" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Product Number</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="brandName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="genericName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Generic Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="category" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Combobox
                    options={PRODUCT_CATEGORIES}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    placeholder="Select or search category"
                    searchPlaceholder="Search categories..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="productType" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="ndcNumber" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>NDC Number</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="dosageForm" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage Form</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="unitOfMeasure" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit of measure" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="price" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    min={0}
                    step="0.01"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="reorderThreshold" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter reorder threshold"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="controlledSubstanceSchedule" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Controlled Substance Schedule</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="storageRequirements" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Requirements</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-6 mt-12">
            <FormField name="requiresPrescription" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Requires Prescription</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="isActive" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="flex justify-end border-t pt-4 mt-2 sticky bottom-0 bg-white">
          <Button type="submit">
            Update Product
          </Button>
        </div>
      </form>
    </Form>


  </div>
  );
}