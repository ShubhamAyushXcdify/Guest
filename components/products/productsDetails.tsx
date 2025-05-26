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
import { useGetClinic } from "@/queries/clinic/get-clinic";

const PRODUCT_TYPES = ["medication", "vaccine", "supply", "food", "supplement"];

interface ProductDetailsProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ProductDetails({ productId, onSuccess }: ProductDetailsProps) {
  const router = useRouter();
  
  const { data: product, isLoading } = useGetProductById(productId);
  const { data: clinics } = useGetClinic();
  const updateProduct = useUpdateProduct();
  
  const form = useForm<Product>({
    defaultValues: product,
  });
  
  // Update form values when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset(product);
    }
  }, [product, form]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!product) {
    return <div>Product not found</div>;
  }
  
  const handleSubmit = async (values: Product) => {
    try {
      await updateProduct.mutateAsync(values);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
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
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="genericName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Generic Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="category" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input {...field} />
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
          
          <FormField name="manufacturer" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="ndcNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>NDC Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="strength" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Strength</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="dosageForm" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Dosage Form</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="unitOfMeasure" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measure</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="controlledSubstanceSchedule" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Controlled Substance Schedule</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="storageRequirements" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Requirements</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
            Update Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
