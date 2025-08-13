import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import { useUpdateClinic } from "@/queries/clinic/update-clinic";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Clinic } from ".";
import { useGetClinicById } from "@/queries/clinic/get-clinic-by-id";
import { DatePicker } from "../ui/datePicker";
import AdvancedMap from "../map/advanced-map";
import { LocationData } from "../map/hooks/useMapAdvanced";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGetCompanies } from "@/queries/companies/get-company";
import { Textarea } from "../ui/textarea";
import { useRootContext } from "@/context/RootContext";
import { getCompanyId } from "@/utils/clientCookie";

type ClinicDetailsProps = {
  clinicId: string;
  onSuccess?: () => void;
};

export default function ClinicDetails({ clinicId, onSuccess }: ClinicDetailsProps) {
  const router = useRouter();
  const [isFormReady, setIsFormReady] = useState(false);
  const { user } = useRootContext();
  
  const { data: clinic, isLoading } = useGetClinicById(clinicId);
  const { data: companies, isLoading: companiesLoading } = useGetCompanies();
  const updateClinic = useUpdateClinic();
  
  const form = useForm<Clinic>({
    defaultValues: {
      id: "",
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
      // subscriptionStatus: "",
      // subscriptionExpiresAt: "",
      location: {
        lat: 0,
        lng: 0,
        address: "",
      }
      // Add any other default fields here
    }
  });
  
  // Update form values when clinic data is loaded
  useEffect(() => {
    if (clinic) {
      // If location fields are null, initialize with default values for the form
      const clinicWithDefaultLocation = {
        ...clinic,
        location: clinic.location ? {
          lat: clinic.location.lat || 0,
          lng: clinic.location.lng || 0,
          address: clinic.location.address || "",
        } : {
          lat: 0,
          lng: 0,
          address: "",
        }
      };
      
      form.reset(clinicWithDefaultLocation);
      setIsFormReady(true);
    }
  }, [clinic, form]);

  // Set company ID from local storage if not already set (for new clinics or when company is not set)
  useEffect(() => {
    const companyId = getCompanyId();
    if (companyId && !form.getValues('companyId')) {
      form.setValue('companyId', companyId);
    }
  }, [form]);

  // Alternative: Set company ID from user context if not already set
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
    }, {
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
      
      if (city) {
        form.setValue('city', city);
      }
      
      if (state) {
        form.setValue('state', state);
      }
      
      if (isPostalNumeric) {
        form.setValue('postalCode', postalCode);
      } else if (addressParts.some(part => /^\d+$/.test(part))) {
        // If postal code isn't numeric but there is a numeric part somewhere, use that as postal code
        const numericPart = addressParts.find(part => /^\d+$/.test(part));
        if (numericPart) {
          form.setValue('postalCode', numericPart);
        }
      }
      
      if (country) {
        form.setValue('country', country);
      }
    }
    
    toast({
      title: "Location Updated",
      description: "Clinic location has been updated successfully",
      duration: 800,
    });
  };
  
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
        title: "Clinic Updated",
        description: "Clinic has been updated successfully",
        variant: "success",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update clinic",
        variant: "destructive",
      });
    }
  };
  
  if (!isFormReady) {
    return <div>Preparing form...</div>;
  }
  
  return (
    <div className="h-[calc(100vh-10rem)] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full pb-20">
            <div className="grid grid-cols-2 gap-8">
              <FormField name="companyId" control={form.control} render={({ field }) => {
                const selectedCompany = companies?.find(company => company.id === field.value);
                const isPreSelected = !!field.value && (getCompanyId() === field.value || user?.companyId === field.value);
                const isExistingClinic = !!clinic?.companyId; // Check if this is an existing clinic with a company
                
                return (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isPreSelected || isExistingClinic}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            companiesLoading 
                              ? "Loading companies..." 
                              : (isPreSelected || isExistingClinic) && selectedCompany
                              ? `${selectedCompany.name}${isPreSelected ? ' (Auto-selected)' : ''}`
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
                    {isExistingClinic && selectedCompany && !isPreSelected && (
                      <p className="text-sm text-muted-foreground">
                        Company cannot be changed for existing clinic: {selectedCompany.name}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }} />

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
              
              {/* <FormField name="subscriptionStatus" control={form.control} render={({ field }) => (
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
              )} /> */}
            </div>

            {/* Location Selection Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Clinic Location</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Update the clinic location by selecting a position on the map below. This will automatically update the coordinates and address.
                </p>
                
                {/* Display current location data if set */}
                {form.watch('location.lat') !== 0 && form.watch('location.lng') !== 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-900">Current Location</p>
                    <p className="text-sm text-blue-700">{form.watch('location.address') || form.watch('addressLine1')}</p>
                    <p className="text-xs text-blue-600">
                      Lat: {form.watch('location.lat').toFixed(6)}, Lng: {form.watch('location.lng').toFixed(6)}
                    </p>
                  </div>
                )}
                
                <AdvancedMap 
                  onSaveLocation={handleLocationSelect}
                  className="h-[400px]"
                  initialLocation={form.watch('location.lat') !== 0 && form.watch('location.lng') !== 0 ? {
                    lat: form.watch('location.lat'),
                    lng: form.watch('location.lng'),
                    address: form.watch('location.address') || form.watch('addressLine1') || ""
                  } : undefined}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-60">
            <Button type="submit">
                Update Clinic
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
