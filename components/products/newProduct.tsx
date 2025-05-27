'use client';

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
import { useGetClinic } from "@/queries/clinic/get-clinic";

type ProductFormValues = Omit<Product, "id">;

const PRODUCT_TYPES = ["medication", "vaccine", "supply", "food", "supplement"];

interface NewProductProps {
  onSuccess?: () => void;
}

export default function NewProduct({ onSuccess }: NewProductProps) {
  const router = useRouter();
  const { data: clinics } = useGetClinic();
  
  const createProduct = useCreateProduct({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/products");
      }
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
      clinicId: "",
      name: "",
      genericName: "",
      category: "",
      productType: "",
      manufacturer: "",
      ndcNumber: "",
      strength: "",
      dosageForm: "",
      unitOfMeasure: "",
      requiresPrescription: false,
      controlledSubstanceSchedule: "",
      storageRequirements: "",
      isActive: true,
    },
  });
  
  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await createProduct.mutateAsync(values);
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full">
        <div className="grid grid-cols-2 gap-8">
          <FormField name="clinicId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a clinic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clinics?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormControl><Input {...field} /></FormControl>
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
          
          <FormField name="manufacturer" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="ndcNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>NDC Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="strength" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Strength</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
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
              <FormControl><Input {...field} /></FormControl>
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
          
          <FormField name="storageRequirements" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Requirements</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
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
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Create Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
