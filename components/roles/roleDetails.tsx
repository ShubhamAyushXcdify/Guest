'use client';

import { useState, useEffect } from "react";
import { useGetRoleById } from "@/queries/roles/get-role-by-id";
import { useUpdateRole } from "@/queries/roles/update-role";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { Switch } from "../ui/switch";
import { Role } from "@/queries/roles/get-role";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";

type RoleFormValues = {
  id: string;
  name: string;
  value: string;
  isPrivileged: boolean;
  metadata: string;
  isClinicRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

type UpdateRolePayload = {
  name: string;
  value: string;
  isPrivileged: boolean;
  metadata: string | null;
  isClinicRequired: boolean;
};

interface RoleDetailsProps {
  roleId: string;
  onSuccess?: () => void;
}

export default function RoleDetails({ roleId, onSuccess }: RoleDetailsProps) {
  const router = useRouter();
  
  const { data: role, isLoading } = useGetRoleById(roleId);
  const updateRole = useUpdateRole();
  
  // Initialize form with empty values that will be updated when data is loaded
  const form = useForm<RoleFormValues>({
    defaultValues: {
      id: roleId,
      name: "",
      value: "",
      isPrivileged: false,
      metadata: "{}",
      isClinicRequired: false,
      createdAt: "",
      updatedAt: ""
    }
  });
  
  // Update form values when role data is loaded
  useEffect(() => {
    if (role) {
      form.reset(role);
    }
  }, [role, form]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!role) {
    return <div>Role not found</div>;
  }
  
  const handleSubmit = async (values: RoleFormValues) => {
    try {
      // Create the update payload with only the required fields
      const updatePayload: UpdateRolePayload = {
        name: values.name,
        value: values.value,
        isPrivileged: values.isPrivileged,
        metadata: null,
        isClinicRequired: values.isClinicRequired
      };

      await updateRole.mutateAsync({ id: roleId, ...updatePayload });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="value" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="isPrivileged" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Privileged</FormLabel>
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

          <FormField name="isClinicRequired" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Clinic Required</FormLabel>
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
            Update Role
          </Button>
        </div>
      </form>
    </Form>
  );
}
