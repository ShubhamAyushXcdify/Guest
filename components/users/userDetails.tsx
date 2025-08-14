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
import { toast } from "@/hooks/use-toast";
import { useGetRole } from "@/queries/roles/get-role";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import { useGetCompanies } from "@/queries/companies/get-company";
import clinic from "../clinic";
import { Combobox } from "../ui/combobox";
import { MultiSelect } from "../ui/mulitselect";
import { useRootContext } from "@/context/RootContext";
import { getCompanyId } from "@/utils/clientCookie";

interface UserDetailsProps {
  userId: string;
  onSuccess?: () => void;
}

export default function UserDetails({ userId, onSuccess }: UserDetailsProps) {
  const router = useRouter();
  const { user: currentUser, userType, clinic: userClinic, loading } = useRootContext();
  const [companyId, setCompanyId] = useState<string | null>(null);

  const { data: user, isLoading } = useGetUserById(userId);
  const { data: rolesData } = useGetRole();
  const { data: clinicData } = useGetClinic(1, 100, companyId, true);
  const { data: companiesData } = useGetCompanies(userType?.isSuperAdmin);
  const updateUser = useUpdateUser();
  
  // Initialize form with empty values that will be updated when data is loaded
  const form = useForm<User & { clinicIds?: string[] }>({
    defaultValues: {
      id: userId,
      email: "",
      passwordHash: "",
      firstName: "",
      lastName: "",
      role: "",
      roleId: "",
      clinicId: "",
      clinicIds: [],
      companyId: "",
      isActive: false
    }
  });
  
  // Set company ID from root context or local storage
  useEffect(() => {
    if (userClinic.companyId) {
      setCompanyId(userClinic.companyId);
    } else if (currentUser?.companyId) {
      setCompanyId(currentUser.companyId);
    } else {
      const storedCompanyId = getCompanyId();
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
      }
    }
  }, [userClinic.companyId, currentUser?.companyId]);

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
        clinicIds: user.clinicId ? [user.clinicId] : [],
        isActive: typeof user.isActive === 'boolean' ? user.isActive : false
      };
      form.reset(defaultValues);
    }
  }, [user, form]);

  // Set clinic ID for clinicAdmin users and prevent changes
  useEffect(() => {
    if (userType.isClinicAdmin && userClinic.id) {
      form.setValue("clinicId", userClinic.id);
      form.setValue("clinicIds", [userClinic.id]);
    }
  }, [userType.isClinicAdmin, userClinic.id, form]);

  const showClinicField = userType?.isAdmin || currentUser?.roleName === 'Administrator'; // Only show for Administrator users

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

  const clinicOptions = React.useMemo(() => {
    const options = clinicData?.items?.map((clinic) => ({
      value: clinic.id,
      label: clinic.name
    })) || [];
    console.log('Debug - clinicOptions:', options);
    console.log('Debug - clinicData:', clinicData);
    console.log('Debug - companyId:', companyId);
    return options;
  }, [clinicData?.items]);

  // Debug logging
  console.log('Debug - userType:', userType);
  console.log('Debug - currentUser:', currentUser);
  console.log('Debug - currentUser.roleName:', currentUser?.roleName);
  console.log('Debug - userType.isAdmin:', userType?.isAdmin);
  console.log('Debug - showClinicField:', showClinicField);

  if (isLoading || loading || !currentUser) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  const handleSubmit = async (values: User & { clinicIds?: string[] }) => {
    try {
      // Find the selected role to ensure we have the correct data
      const roleToSend = rolesData?.data?.find((role : any) => role.id === values.roleId);

      // Determine clinicIds values based on user role
      let clinicIds: string[] = [];

      if (userType.isClinicAdmin && userClinic.id) {
        // For clinicAdmin, always use their clinic ID
        clinicIds = [userClinic.id];
      } else if ((userType?.isAdmin || currentUser?.roleName === 'Administrator') && values.clinicIds && values.clinicIds.length > 0) {
        // For Administrator users, use the selected clinics
        clinicIds = values.clinicIds;
      }

      // Extract lastName to handle separately
      const { lastName } = values;

      // Create the payload matching the PUT API structure
      const payload = {
        id: values.id,
        email: values.email,
        passwordHash: values.passwordHash,
        firstName: values.firstName,
        lastName: lastName ? lastName : null,
        roleId: roleToSend?.id,
        companyId: values.companyId,
        clinicIds: clinicIds, // Array of clinic IDs
        isActive: true,
        slots: [] // Empty slots array as per API
      };

      await updateUser.mutateAsync(payload);
      toast({
        title: "User Updated",
        description: "User details have been updated",
        variant: "success",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "error",
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

          {!userType?.isSuperAdmin && (
            <FormField name="roleId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Combobox
                    options={roleOptions}
                    value={field.value?.toString()}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset clinic IDs when role changes (unless clinicAdmin)
                      if (!userType.isClinicAdmin) {
                        form.setValue("clinicId", "");
                        form.setValue("clinicIds", []);
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
          )}

          {userType?.isSuperAdmin && (
            <FormField name="companyId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Combobox
                    options={companiesData?.map((company: any) => ({
                      value: company.id,
                      label: company.name
                    })) || []}
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                    placeholder="Select company"
                    searchPlaceholder="Search companies..."
                    emptyText="No companies found"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}

          {showClinicField && (
            <FormField name="clinicIds" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Clinics</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={clinicOptions}
                    defaultValue={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Select clinics"
                    maxCount={3}
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