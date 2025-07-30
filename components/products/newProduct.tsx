'use client';
 
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCreateProduct } from "@/queries/products/create-products";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { Product } from ".";
import ProductCodes from "./ProductCodes";

import { Combobox } from "../ui/combobox";
 
type ProductFormValues = Omit<Product, "id">;
 
const PRODUCT_TYPES = ["medication", "vaccine", "supply", "food", "supplement"];
const UNIT_OF_MEASURE_OPTIONS = [
  { value: "EA", label: "Each (EA)" },
  { value: "STRIP", label: "Strip" },
  { value: "BOTTLE", label: "Bottle" },
  { value: "BOX", label: "Box" },
  { value: "ML", label: "Milliliter (ML)" },
  { value: "L", label: "Liter (L)" },
  { value: "G", label: "Gram (G)" },
  { value: "KG", label: "Kilogram (KG)" }
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
 
interface NewProductProps {
  onSuccess?: () => void;
}
 
export default function NewProduct({ onSuccess }: NewProductProps) {
  const router = useRouter();
  const [createdProduct, setCreatedProduct] = useState<{ id: string; productNumber: string; name: string } | null>(null);
  // const { data: clinicData } = useGetClinic();
 
  // Extract clinic items from the paginated response
  // const clinics = clinicData?.items || [];
 
  const createProduct = useCreateProduct({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });
 
  const form = useForm<ProductFormValues>({
    defaultValues: {
      productNumber: "",
      name: "",
      brandName: "", // <-- Added brandName default
      genericName: "",
      category: "",
      productType: "",
      manufacturer: "",
      ndcNumber: "",
      strength: "",
      dosageForm: "",
      unitOfMeasure: "EA",
      requiresPrescription: false,
      controlledSubstanceSchedule: "",
      storageRequirements: "",
      reorderThreshold: null,
      price: 0,
      isActive: true,
    },
  });
 
  const handleSubmit = async (values: ProductFormValues) => {
    try {
      const result = await createProduct.mutateAsync(values);
      // Store the created product data to show codes
      setCreatedProduct({
        id: result.id,
        productNumber: result.productNumber,
        name: result.name
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };
 
  return (
    <div className="flex flex-col w-full h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col w-full h-full">
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="grid grid-cols-2 gap-8">
            
            <FormField name="productNumber" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Product Number</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
           
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
           
            <FormField name="brandName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
           
            <FormField name="genericName" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Generic Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
           
            <FormField name="category" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Combobox
                    options={PRODUCT_CATEGORIES}
                    value={field.value}
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
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
           
            {/* <FormField name="manufacturer" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} /> */}
           
            <FormField name="ndcNumber" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>NDC Number</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
           
            {/* <FormField name="strength" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Strength</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} /> */}
           
            <FormField name="dosageForm" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage Form</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
           
            <FormField name="unitOfMeasure" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "EA"}
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
           
            <FormField name="controlledSubstanceSchedule" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Controlled Substance Schedule</FormLabel>
                <FormControl><Input {...field} /></FormControl>
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
           
            <FormField name="storageRequirements" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Requirements</FormLabel>
                <FormControl><Input {...field} /></FormControl>
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
                    checked={field.value}
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
                    checked={field.value}
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
            Create Product
          </Button>
        </div>
      </form>
    </Form>

    {/* Show Product Codes after creation */}
    {createdProduct && (
      <div className="mt-8">
        <ProductCodes 
          productId={createdProduct.id}
          productNumber={createdProduct.productNumber}
          productName={createdProduct.name}
        />
        <div className="flex justify-center mt-4 gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setCreatedProduct(null);
              form.reset();
            }}
          >
            Create Another Product
          </Button>
          <Button
            onClick={() => {
              if (onSuccess) {
                onSuccess();
              } else {
                router.push("/products");
                router.refresh();
              }
            }}
          >
            Go to Products
          </Button>
        </div>
      </div>
    )}
  </div>
  );
}