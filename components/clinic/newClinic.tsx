import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCreateClinic } from "@/queries/clinic/create-clinic";
import { toast } from "@/hooks/use-toast";
import { Clinic } from "./index";
import { DatePicker } from "../ui/datePicker";
import AdvancedMap from "../map/advanced-map";
import { LocationData } from "../map/hooks/useMapAdvanced";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGetCompanies } from "@/queries/companies/get-company";
import { Textarea } from "../ui/textarea";
import { useRootContext } from "@/context/RootContext";
import { getCompanyId } from "@/utils/clientCookie";
import { useEffect } from "react";

type NewClinicProps = {
  onSuccess?: () => void;
};

export default function NewClinic({ onSuccess }: NewClinicProps) {
  const router = useRouter();
  const { user } = useRootContext();
  
  // Fetch companies for selection
  const { data: companies, isLoading: companiesLoading } = useGetCompanies();
  
  const createClinic = useCreateClinic({
    onSuccess: () => {
      toast({
        title: "Clinic Created",
        description: "Clinic has been created successfully",
        variant: "success",
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
        description: error instanceof Error ? error.message : "Failed to create clinic",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<Omit<Clinic, "id" | "createdAt" | "updatedAt">>({
    defaultValues: {
      companyId: "",
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

  // Set company ID from local storage or user context
  useEffect(() => {
    const companyId = getCompanyId();
    if (companyId && !form.getValues('companyId')) {
      form.setValue('companyId', companyId);
    }
  }, [form]);

  // Alternative: Set company ID when user data is available
  useEffect(() => {
    if (user?.companyId && !form.getValues('companyId')) {
      form.setValue('companyId', user.companyId);
    }
  }, [user, form]);

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
    
    // Parse the address with a more flexible approach for international formats
    const addressParts = location.address.split(', ');
    
    if (addressParts.length >= 4) {
      // For Indian addresses like: "Sindagi, Kalaburagi taluku, Kalaburagi, Karnataka, 585103, India"
      // We need to identify the city, state, postal code correctly
      
      // Usually format is: [locality], [subdivision], [city], [state], [postal code], [country]
      const city = addressParts[addressParts.length - 4] || ''; // City is typically 4th from last
      const state = addressParts[addressParts.length - 3] || ''; // State is typically 3rd from last
      const postalCode = addressParts[addressParts.length - 2] || ''; // Postal code is typically 2nd from last
      const country = addressParts[addressParts.length - 1] || ''; // Country is last
      
      // Try to detect if postal code is numeric
      const isPostalNumeric = /^\d+$/.test(postalCode);
      
      if (city && !form.getValues('city')) {
        form.setValue('city', city);
      }
      
      if (state && !form.getValues('state')) {
        form.setValue('state', state);
      }
      
      if (isPostalNumeric && !form.getValues('postalCode')) {
        form.setValue('postalCode', postalCode);
      } else if (!isPostalNumeric && addressParts.some(part => /^\d+$/.test(part))) {
        // If postal code isn't numeric but there is a numeric part somewhere, use that as postal code
        const numericPart = addressParts.find(part => /^\d+$/.test(part));
        if (numericPart) {
          form.setValue('postalCode', numericPart);
        }
      }
      
      if (country && !form.getValues('country')) {
        form.setValue('country', country);
      }
    }
    
    toast({
      title: "Location Saved",
      description: "Location has been saved for the clinic",
      duration: 800,
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
          <FormField name="companyId" control={form.control} render={({ field }) => {
            const selectedCompany = companies?.find(company => company.id === field.value);
            const isPreSelected = !!field.value && (getCompanyId() === field.value || user?.companyId === field.value);
            
            return (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isPreSelected}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        companiesLoading 
                          ? "Loading companies..." 
                          : isPreSelected && selectedCompany
                          ? `${selectedCompany.name} (Auto-selected)`
                          : "Select a company"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {isPreSelected && selectedCompany && (
                  <p className="text-sm text-muted-foreground">
                    Company automatically selected from your profile: {selectedCompany.name}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            );
          }} />

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
              <div className="mb-4 p-3 w-full bg-blue-50 border border-blue-200 rounded-md">
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
        
        <div className="flex justify-end mt-6 pt-60">
          <Button type="submit">
            Create Clinic
          </Button>
        </div>
      </form>
    </Form>
  );
}
