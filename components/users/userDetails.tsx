'use client';

import { useState, useEffect } from "react";
import React from "react";
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
import { useRootContext } from "@/context/RootContext";

interface UserDetailsProps {
  userId: string;
  onSuccess?: () => void;
}

export default function UserDetails({ userId, onSuccess }: UserDetailsProps) {
  const router = useRouter();
  const { user: currentUser, userType, clinic: userClinic } = useRootContext();
  
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

  // Set clinic ID for clinicAdmin users and prevent changes
  useEffect(() => {
    if (userType.isClinicAdmin && userClinic.id) {
      form.setValue("clinicId", userClinic.id);
    }
  }, [userType.isClinicAdmin, userClinic.id, form]);

  const selectedRole = rolesData?.data?.find((role:any) => role.id === form.watch("roleId"));
  const showClinicField = selectedRole?.isClinicRequired && !userType.isClinicAdmin;

  // Filter roles based on current user's role priority
  const roleOptions = React.useMemo(() => {
    if (!rolesData?.data || !currentUser) return [];

    // Get the current user's role priority
    const currentRolePriority = rolesData.data.find((role:any) => 
      role.id === currentUser.roleId
    )?.priority || 0;

    // Filter roles to only show those with higher priority numbers (lower privilege)
    const filteredRoles = rolesData.data.filter((role:any) => 
      role.priority > currentRolePriority
    );

    // If the user being edited already has a role with equal or lower priority number,
    // we should still include that role in the options to avoid removing their current role
    if (user?.roleId) {
      const userCurrentRole = rolesData.data.find((role:any) => role.id === user.roleId);
      if (userCurrentRole && userCurrentRole.priority <= currentRolePriority) {
        filteredRoles.push(userCurrentRole);
      }
    }

    return filteredRoles.map((role:any) => ({
      value: role.id,
      label: role.name
    }));
  }, [rolesData?.data, currentUser, user]);
  
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
      
      // Determine clinicId value: 
      // - Use userClinic.id if user is clinicAdmin
      // - Use form value if role requires clinic and not empty
      // - Null otherwise
      let clinicId = null;
      if (userType.isClinicAdmin && userClinic.id) {
        clinicId = userClinic.id;
      } else if (selectedRole?.isClinicRequired && values.clinicId) {
        clinicId = values.clinicId;
      }
      
      // Extract lastName to handle separately
      const { lastName, ...restValues } = values;
      
      // Create the payload with role and clinic information
      const payload = {
        ...restValues,
        lastName: lastName ? lastName : null, // Set lastName to null if empty
        isActive: true,
        role: roleToSend?.name,
        roleId: roleToSend?.id,
        clinicId: clinicId, // Set based on conditions above
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
                  options={roleOptions}
                  value={field.value?.toString()}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset clinicId when role changes (unless clinicAdmin)
                    if (!userType.isClinicAdmin) {
                      form.setValue("clinicId", "");
                    }
                  }}
                  placeholder="Select role"
                  searchPlaceholder="Search roles..."
                  emptyText="No roles found"
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