import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import { useUpdateClinic } from "@/queries/clinic/update-clinic";
import { toast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Clinic } from ".";
import { useGetClinicById } from "@/queries/clinic/get-clinic-by-id";
import { DatePicker } from "../ui/datePicker";

type ClinicDetailsProps = {
  clinicId: string;
  onSuccess?: () => void;
};

export default function ClinicDetails({ clinicId, onSuccess }: ClinicDetailsProps) {
  const router = useRouter();
  const [isFormReady, setIsFormReady] = useState(false);
  
  const { data: clinic, isLoading } = useGetClinicById(clinicId);
  const updateClinic = useUpdateClinic();
  
  const form = useForm<Clinic>({
    defaultValues: {
      id: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      email: "",
      website: "",
      taxId: "",
      licenseNumber: "",
      subscriptionStatus: "",
      subscriptionExpiresAt: "",
      // Add any other default fields here
    }
  });
  
  // Update form values when clinic data is loaded
  useEffect(() => {
    if (clinic) {
      form.reset(clinic);
      setIsFormReady(true);
    }
  }, [clinic, form]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!clinic) {
    return <div>Clinic not found</div>;
  }
  
  const handleSubmit = async (values: Clinic) => {
    try {
      await updateClinic.mutateAsync(values);
      toast({
        title: "Success",
        description: "Clinic updated successfully",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update clinic",
        variant: "destructive",
      });
    }
  };
  
  if (!isFormReady) {
    return <div>Preparing form...</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full">
        <div className="grid grid-cols-2 gap-8">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="addressLine1" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="addressLine2" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="city" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="state" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="postalCode" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="country" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="website" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="taxId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="licenseNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="subscriptionStatus" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Status</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="subscriptionExpiresAt" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Expires At</FormLabel>
              <FormControl>
                <DatePicker 
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Update Clinic
          </Button>
        </div>
      </form>
    </Form>
  );
}
