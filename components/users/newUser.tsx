'use client';

import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCreateUser } from "@/queries/users/create-user";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { User } from ".";
import { Role, useGetRole } from "@/queries/roles/get-role";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import React, { useEffect, useState } from "react";
import { Combobox } from "../ui/combobox";
import { useRootContext } from "@/context/RootContext";
import { Eye, EyeOff } from "lucide-react";

type UserFormValues = Omit<User, "id" | "lastLogin" | "createdAt" | "updatedAt"> & {
  clinicId?: string;
};

interface NewUserProps {
  onSuccess?: () => void;
}

export default function NewUser({ onSuccess }: NewUserProps) {
  const router = useRouter();
  const { user: currentUser, userType, clinic } = useRootContext();
  const [showPassword, setShowPassword] = useState(false);
  
  const createUser = useCreateUser({
    onSuccess: () => {
      toast({
        title: "User Added",
        description: "User has been added successfully",
        variant: "success",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/users");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
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
      clinicId: "",
    },
  });
  
  const { data: rolesData } = useGetRole();
  const { data: clinicData } = useGetClinic();
  
  const selectedRole = rolesData?.data?.find((role: Role) => role.value === form.watch("role"));
  const showClinicField = selectedRole?.isClinicRequired && !userType.isClinicAdmin ;

  // Set clinic ID for clinicAdmin users
  useEffect(() => {
     if ((userType.isClinicAdmin || userType.isVeterinarian) && clinic.id) {
      form.setValue("clinicId", clinic.id);
    }
  }, [userType.isClinicAdmin, userType.isVeterinarian, clinic.id, form]);

  const roleOptions = React.useMemo(() => {
    // Get the current user's role priority
    const currentRolePriority = rolesData?.data?.find((role: Role) => 
      role.id === currentUser?.roleId
    )?.priority || 0;

    // Filter roles to only show those with higher priority numbers (lower privilege)
    const filteredRoles = rolesData?.data?.filter((role: Role) => 
      role.priority > currentRolePriority
    ) || [];

    return filteredRoles.map((role: Role) => ({
      value: role.value,
      label: role.name
    }));
  }, [rolesData?.data, currentUser]);

  const clinicOptions = React.useMemo(() => {
    return clinicData?.items?.map((clinic) => ({
      value: clinic.id,
      label: clinic.name
    })) || [];
  }, [clinicData?.items]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      // Find the selected role again to ensure we have the correct id and name at submission time
      const roleToSend = rolesData?.data?.find((role: Role) => role.value === values.role);

      // Create the payload, excluding the original 'role' value and adding 'roleId' and 'roleName'
      const { role, lastName, ...rest } = values; // Exclude the 'role' field
      
      // Determine clinicId value based on user role
      let clinicId = null;
      if ((userType.isClinicAdmin || userType.isVeterinarian) && clinic.id) {
        // For clinicAdmin, always use their clinic ID
        clinicId = clinic.id;
      } else if (roleToSend?.isClinicRequired && values.clinicId) {
        // For others, use the selected clinic if required
        clinicId = values.clinicId;
      }
      
      const payload = {
        ...rest, // Include all other fields from values
        lastName: lastName ? lastName : null, // Set lastName to null if empty
        isActive: true,
        roleId: roleToSend?.id, // Add the roleId
        role: roleToSend?.name, // Add the roleName
        clinicId: clinicId, // Set based on conditions above
      };

      await createUser.mutateAsync(payload as any); // Added 'as any' temporarily for type compatibility, you might need to adjust your mutation's expected type

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
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="lastName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
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
          
          <FormField name="passwordHash" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    {...field} 
                    type={showPassword ? "text" : "password"} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="role" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Combobox
                  options={roleOptions}
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Only reset clinic ID if not a clinicAdmin
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
                    options={clinicOptions}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Select clinic"
                    searchPlaceholder="Search clinics..."
                    emptyText="No clinics found"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
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
