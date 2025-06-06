'use client';

import { useState, useEffect } from "react";
import { useGetUserById } from "@/queries/users/get-user-by-id";
import { useUpdateUser } from "@/queries/users/update-user";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";
import { User } from ".";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { useGetRole } from "@/queries/roles/get-role";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import clinic from "../clinic";
import { Combobox } from "../ui/combobox";

interface UserDetailsProps {
  userId: string;
  onSuccess?: () => void;
}

export default function UserDetails({ userId, onSuccess }: UserDetailsProps) {
  const router = useRouter();
  
  const { data: user, isLoading } = useGetUserById(userId);
  const { data: rolesData } = useGetRole();
  const { data: clinicData } = useGetClinic();
  const updateUser = useUpdateUser();
  
  // Initialize form with empty values that will be updated when data is loaded
  const form = useForm<User>({
    defaultValues: {
      id: userId,
      email: "",
      passwordHash: "",
      firstName: "",
      lastName: "",
      role: "",
      roleId: "",
      clinicId: "",
      isActive: false
    }
  });
  
  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      // Make sure all fields have defined values
      const defaultValues = {
        ...user,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "",
        roleId: user.roleId || "",
        clinicId: user.clinicId || "",
        isActive: typeof user.isActive === 'boolean' ? user.isActive : false
      };
      form.reset(defaultValues);
    }
  }, [user, form]);

  const selectedRole = rolesData?.data?.find((role:any) => role.id === form.watch("roleId"));
  const showClinicField = selectedRole?.isClinicRequired;
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  const handleSubmit = async (values: User) => {
    try {
      // Find the selected role to ensure we have the correct data
      const roleToSend = rolesData?.data?.find((role : any) => role.id === values.roleId);
      
      // Create the payload with role and clinic information
      const payload = {
        ...values,
        isActive: true,
        role: roleToSend?.name,
        roleId: roleToSend?.id,
        clinicId: selectedRole?.isClinicRequired ? values.clinicId : null,
      };

      await updateUser.mutateAsync(payload);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
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
          
          <FormField name="roleId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Combobox
                  options={rolesData?.data?.map((role: any) => ({
                    value: role.id,
                    label: role.name
                  })) || []}
                  value={field.value?.toString()}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset clinicId when role changes
                    form.setValue("clinicId", "");
                  }}
                  placeholder="Select role"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {showClinicField && (
            <FormField name="clinicId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic</FormLabel>
                <FormControl>
                  <Combobox
                    options={clinicData?.items?.map((clinic) => ({
                      value: clinic.id,
                      label: clinic.name
                    })) || []}
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                    placeholder="Select clinic"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Update User
          </Button>
        </div>
      </form>
    </Form>
  );
} 