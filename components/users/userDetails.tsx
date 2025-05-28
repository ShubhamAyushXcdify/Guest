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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const USER_ROLES = [
  "admin", 
  "clinicAdmin",
  "veterinarian",  
  "receptionist", 
  "technician", 
  "supplier",
  "patient",
  "client"
];

interface UserDetailsProps {
  userId: string;
  onSuccess?: () => void;
}

export default function UserDetails({ userId, onSuccess }: UserDetailsProps) {
  const router = useRouter();
  
  const { data: user, isLoading } = useGetUserById(userId);
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
        isActive: typeof user.isActive === 'boolean' ? user.isActive : false
      };
      
      form.reset(defaultValues);
    }
  }, [user, form]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  const handleSubmit = async (values: User) => {
    try {
      await updateUser.mutateAsync(values);
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
  
  // Ensure we have a role value from the user data
  const userRole = user?.role || "";
  
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
          
          {/* Use the direct user role data instead of relying on form state */}
          <div className="space-y-2">
            <FormLabel>Role</FormLabel>
            <Select 
              defaultValue={userRole}
              onValueChange={(value) => form.setValue("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        
          <FormField name="isActive" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
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