import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCreateSupplier } from "@/queries/suppliers/create-supplier";
import { toast } from "../ui/use-toast";
import { Supplier } from "./index";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGetClinic } from "@/queries/clinic/get-clinic";

type NewSupplierProps = {
  onSuccess?: () => void;
};

export default function NewSupplier({ onSuccess }: NewSupplierProps) {
  const router = useRouter();
  const { data: clinicsData } = useGetClinic();
  const clinics = clinicsData?.items || [];
  
  const createSupplier = useCreateSupplier({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Supplier created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/suppliers");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create supplier",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<Omit<Supplier, "id" | "createdAt" | "updatedAt">>({
    defaultValues: {
      clinicId: "",
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      accountNumber: "",
      paymentTerms: "",
      isActive: true,
    },
  });
  
  const handleSubmit = async (values: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createSupplier.mutateAsync(values);
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full">
        <div className="grid grid-cols-1 gap-8">
          <FormField name="clinicId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          
          <FormField name="contactPerson" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} type="email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="addressLine1" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="addressLine2" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="city" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="state" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="postalCode" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="accountNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="paymentTerms" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="isActive" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Set whether this supplier is active or not
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )} />
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Create Supplier
          </Button>
        </div>
      </form>
    </Form>
  );
} 