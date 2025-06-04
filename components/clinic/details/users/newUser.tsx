'use client';

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateUser } from "@/queries/users/create-user";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from ".";
import { Role, useGetRole } from "@/queries/roles/get-role";
import React from "react";

type UserFormValues = Omit<User, "id" | "lastLogin" | "createdAt" | "updatedAt">;

interface NewUserProps {
  clinicId?: string;
  onSuccess?: () => void;
}

export default function NewUser({ clinicId, onSuccess }: NewUserProps) {
  const router = useRouter();
  
  const createUser = useCreateUser({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
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
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<UserFormValues>({
    defaultValues: {
      email: "",
      passwordHash: "",
      firstName: "",
      lastName: "",
      role: "",
      isActive: true,
    },
  });
  
  const { data: rolesData } = useGetRole();
  
  const handleSubmit = async (values: UserFormValues) => {
    try {
      // Find the selected role to get the id and name
      const roleToSend = rolesData?.data?.find((role: Role) => role.value === values.role);

      // Create the payload with role information
      const { role, ...rest } = values; // Exclude the 'role' field
      const payload = {
        ...rest,
        isActive: true,
        clinicId: clinicId || "", // Always use the provided clinicId
        roleId: roleToSend?.id, // Add the roleId
        role: roleToSend?.name, // Add the roleName
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
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
}