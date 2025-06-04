'use client';

import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateUser } from "@/queries/users/create-user";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Doctor } from ".";
import { useGetRole } from "@/queries/roles/get-role";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type DoctorFormValues = Omit<Doctor, "id" | "lastLogin" | "createdAt" | "updatedAt" | "role"> & {
  clinicId?: string;
};

interface NewDoctorProps {
  clinicId?: string;
  onSuccess?: () => void;
}

export default function NewDoctor({ clinicId, onSuccess }: NewDoctorProps) {
  const router = useRouter();
  
  const createUser = useCreateUser({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Doctor created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/clinic");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create doctor",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<DoctorFormValues>({
    defaultValues: {
      email: "",
      passwordHash: "",
      firstName: "",
      lastName: "",
      isActive: true,
      clinicId: clinicId || "",
    },
  });
  
  const { data: rolesData } = useGetRole();
  const { data: clinicData } = useGetClinic();
  
  // Find veterinarian role
  const veterinarianRole = rolesData?.data?.find((role: any) => 
    role.name.toLowerCase() === 'veterinarian'
  );
  
  const handleSubmit = async (values: DoctorFormValues) => {
    try {
      const payload = {
        ...values,
        isActive: true,
        clinicId: values.clinicId || clinicId || "",
        roleId: veterinarianRole?.id, 
        role: "Veterinarian", // Always set role to Veterinarian with capital first letter
      };

      await createUser.mutateAsync(payload);
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <FormField name="firstName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="lastName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl><Input {...field} value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} type="email" value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="passwordHash" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input {...field} type="password" value={field.value || ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {!clinicId && (
            <FormField name="clinicId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clinicData?.items?.map((clinic: any) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Create Doctor
          </Button>
        </div>
      </form>
    </Form>
  );
}
