'use client';

import { useState, useEffect } from "react";
import { useGetUserById } from "@/queries/users/get-user-by-id";
import { useUpdateUser } from "@/queries/users/update-user";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Doctor } from ".";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useGetRole } from "@/queries/roles/get-role";

interface DoctorDetailsProps {
  doctorId: string;
  clinicId?: string;
  onSuccess?: () => void;
}

export default function DoctorDetails({ doctorId, clinicId, onSuccess }: DoctorDetailsProps) {
  const router = useRouter();
  
  const { data: doctor, isLoading } = useGetUserById(doctorId);
  const updateUser = useUpdateUser();
  const { data: rolesData } = useGetRole();
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  
  // Find veterinarian role
  const veterinarianRole = rolesData?.data?.find((role: any) => 
    role.name.toLowerCase() === 'veterinarian'
  );
  
  // Initialize form with empty values that will be updated when data is loaded
  const form = useForm<Doctor & { password: string }>({
    defaultValues: {
      id: doctorId,
      email: "",
      passwordHash: "",
      password: "",
      firstName: "",
      lastName: "",
      isActive: false
    }
  });
  
  // Update form values when doctor data is loaded
  useEffect(() => {
    if (doctor) {
      // Make sure all fields have defined values
      const defaultValues = {
        ...doctor,
        firstName: doctor.firstName || "",
        lastName: doctor.lastName || "",
        email: doctor.email || "",
        password: "", // Initialize empty password field
        isActive: typeof doctor.isActive === 'boolean' ? doctor.isActive : false
      };
      
      form.reset(defaultValues);
    }
  }, [doctor, form]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!doctor) {
    return <div>Doctor not found</div>;
  }
  
  const handleSubmit = async (values: Doctor & { password: string }) => {
    try {
      // Add clinicId and always set role to Veterinarian
      const payload = {
        id: values.id,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: "Veterinarian", // Always set role to Veterinarian with capital first letter
        roleId: veterinarianRole?.id || "",
        clinicId: clinicId || (doctor as any).clinicId || "",
        isActive: true, // Always set to true
        passwordHash: values.password && isPasswordDirty ? values.password : doctor.passwordHash || ""
      };
      
      await updateUser.mutateAsync(payload);
      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update doctor",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <FormField name="firstName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="lastName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Password (leave empty to keep unchanged)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password" 
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsPasswordDirty(e.target.value.length > 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Update Doctor
          </Button>
        </div>
      </form>
    </Form>
  );
}
