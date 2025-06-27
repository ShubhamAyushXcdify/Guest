import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCreateClinic } from "@/queries/clinic/create-clinic";
import { toast } from "../ui/use-toast";
import { Clinic } from "./index";
import { DatePicker } from "../ui/datePicker";
import AdvancedMap from "../map/advanced-map";
import { LocationData } from "../map/hooks/useMapAdvanced";

type NewClinicProps = {
  onSuccess?: () => void;
};

export default function NewClinic({ onSuccess }: NewClinicProps) {
  const router = useRouter();
  
  const createClinic = useCreateClinic({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Clinic created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/clinics");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create clinic",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<Omit<Clinic, "id" | "createdAt" | "updatedAt">>({
    defaultValues: {
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
      location: {
        lat: 0,
        lng: 0,
        address: "",
      }
      //subscriptionStatus: "Active",
      //subscriptionExpiresAt: "",
    },
  });

  // Handle location selection from map
  const handleLocationSelect = (location: LocationData) => {
    form.setValue('location', {
      lat: location.lat,
      lng: location.lng,
      address: location.address
    },{
      shouldValidate: true,
    });
    form.setValue('addressLine1', location.address);
    form.setValue('addressLine2', location.address);
    
    // Optionally parse address components and fill in address fields
    // This is a simple implementation - you might want to enhance this
    const addressParts = location.address.split(', ');
    if (addressParts.length >= 3) {
      // Try to extract city, state, country from the address
      const city = addressParts[addressParts.length - 3] || '';
      const state = addressParts[addressParts.length - 2] || '';
      const country = addressParts[addressParts.length - 1] || '';
      
      if (city && !form.getValues('city')) {
        form.setValue('city', city);
      }
      if (state && !form.getValues('state')) {
        form.setValue('state', state);
      }
      if (country && !form.getValues('country')) {
        form.setValue('country', country);
      }
    }
    
    toast({
      title: "Location Selected",
      description: "Location has been set for the clinic",
    });
  };
  
  const handleSubmit = async (values: Omit<Clinic, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Convert subscriptionExpiresAt to UTC if it exists
      // const dataToSubmit = {
      //   ...values,
      //   subscriptionExpiresAt: values.subscriptionExpiresAt 
      //     ? new Date(values.subscriptionExpiresAt).toISOString()
      //     : null
      // };
      //await createClinic.mutateAsync(dataToSubmit);
      await createClinic.mutateAsync(values);
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full">
        <div className="grid grid-cols-2 gap-8">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
          
          <FormField name="country" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl><Input {...field} /></FormControl>
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
          
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} type="email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="website" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="taxId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="licenseNumber" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          {/* <FormField name="subscriptionStatus" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Status</FormLabel>
              <FormControl><Input {...field} /></FormControl>
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
          )} /> */}
        </div>

        {/* Location Selection Section */}
        <div className="space-y-4">
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Clinic Location</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the clinic location on the map below. This will automatically capture the coordinates and address.
            </p>
            
            {/* Display current location data if set */}
            {form.watch('location.address') && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900">Selected Location</p>
                <p className="text-sm text-blue-700">{form.watch('location.address')}</p>
                <p className="text-xs text-blue-600">
                  Lat: {form.watch('location.lat').toFixed(6)}, Lng: {form.watch('location.lng').toFixed(6)}
                </p>
              </div>
            )}
            
            <AdvancedMap 
              onSaveLocation={handleLocationSelect}
              className="h-[400px]"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Create Clinic
          </Button>
        </div>
      </form>
    </Form>
  );
}
