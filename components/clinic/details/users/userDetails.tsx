'use client';

import { useState, useEffect } from "react";
import { useGetUserById } from "@/queries/users/get-user-by-id";
import { useUpdateUser } from "@/queries/users/update-user";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { User } from ".";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role, useGetRole } from "@/queries/roles/get-role";

interface UserDetailsProps {
  userId: string;
  clinicId?: string;
  onSuccess?: () => void;
}

export default function UserDetails({ userId, clinicId, onSuccess }: UserDetailsProps) {
  const router = useRouter();
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  
  const { data: user, isLoading } = useGetUserById(userId);
  const updateUser = useUpdateUser();
  const { data: rolesData } = useGetRole();
  
  // Initialize form with empty values that will be updated when data is loaded
  const form = useForm<User & { password: string }>({
    defaultValues: {
      id: userId,
      email: "",
      passwordHash: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
      isActive: true
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
        password: "", // Initialize empty password field
        isActive: true
      };
      
      form.reset(defaultValues);
      
      // Find and set the selected role if not already set
      if (rolesData?.data && user.roleId) {
        const matchingRole = rolesData.data.find((role: Role) => 
          role.id === user.roleId || role.name === user.role
        );
        if (matchingRole) {
          form.setValue('role', matchingRole.value);
        }
      }
    }
  }, [user, form, rolesData]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  const handleSubmit = async (values: User & { password: string }) => {
    try {
      // Find the selected role to get the roleId
      const selectedRole = rolesData?.data?.find((role: Role) => role.value === values.role || role.name === values.role);
      
      // Only include the specific fields needed for update
      const payload = {
        id: values.id,
        email: values.email,
        passwordHash: values.password && isPasswordDirty ? values.password : user.passwordHash || "",
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role ? (values.role.charAt(0).toUpperCase() + values.role.slice(1)) : "",
        clinicId: clinicId || user.clinicId || "",
        isActive: true
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
          
          <FormField name="role" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rolesData?.data?.map((role: Role) => (
                    <SelectItem key={role.id} value={role.value}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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