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
import { useGetCompanies } from "@/queries/companies/get-company";
import React, { useEffect, useState } from "react";
import { Combobox } from "../ui/combobox";
import { MultiSelect } from "../ui/mulitselect";
import { useRootContext } from "@/context/RootContext";
import { Eye, EyeOff } from "lucide-react";
import { getCompanyId, getClinicId } from "@/utils/clientCookie";

type UserFormValues = Omit<User, "id" | "lastLogin" | "createdAt" | "updatedAt"> & {
  clinicId?: string;
  clinicIds?: string[];
  companyId?: string;
  role?: string;
};

interface NewUserProps {
  onSuccess?: () => void;
}

export default function NewUser({ onSuccess }: NewUserProps) {
  const router = useRouter();
  const { user: currentUser, userType, clinic, loading } = useRootContext();
  const [showPassword, setShowPassword] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
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
      role: userType?.isSuperAdmin ? "Administrator" : "",
      isActive: true,
      clinicId: "",
      clinicIds: [],
      companyId: "",
    },
  });
  
  const { data: rolesData } = useGetRole();
  const { data: clinicData } = useGetClinic(1, 100, companyId, true);
  const { data: companiesData } = useGetCompanies(userType?.isSuperAdmin);
  
  const showClinicField = userType?.isAdmin || currentUser?.roleName === 'Administrator'; // Only show for Administrator users
  const showCompanyField = userType?.isSuperAdmin;
  const showRoleField = !userType?.isSuperAdmin; // Hide role field for superadmin
  const isClinicAdmin = userType?.isClinicAdmin || currentUser?.roleName === 'Clinic Admin';



  // Show loading if user data is not yet loaded
  if (loading || !currentUser) {
    return <div>Loading...</div>;
  }

  // Set company ID from root context or local storage
  useEffect(() => {
    if (clinic.companyId) {
      setCompanyId(clinic.companyId);
    } else if (currentUser?.companyId) {
      setCompanyId(currentUser.companyId);
    } else {
      const storedCompanyId = getCompanyId();
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
      }
    }
  }, [clinic.companyId, currentUser?.companyId]);

  // Set clinic ID for clinicAdmin users - automatically assign their clinic
  useEffect(() => {
    const clinicIdFromCookie = getClinicId();
    // Try both 'id' and 'clinicId' properties as the API might use either
    const clinicIdFromUser = currentUser?.clinics?.[0]?.id || currentUser?.clinics?.[0]?.clinicId;
    const clinicIdToUse = clinicIdFromCookie || clinicIdFromUser;

    if (isClinicAdmin && clinicIdToUse) {
      form.setValue("clinicId", clinicIdToUse);
      form.setValue("clinicIds", [clinicIdToUse]);
    }
  }, [isClinicAdmin, currentUser?.clinics, form]);

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
    const options = clinicData?.items?.map((clinic) => ({
      value: clinic.id,
      label: clinic.name
    })) || [];
    return options;
  }, [clinicData?.items]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      // For superadmin, find Administrator role, otherwise use selected role
      let roleToSend;
      if (userType?.isSuperAdmin) {
        roleToSend = rolesData?.data?.find((role: Role) => role.name === 'Administrator');
      } else {
        roleToSend = rolesData?.data?.find((role: Role) => role.value === values.role);
      }

      // Extract lastName for separate handling
      const { lastName } = values;

      // Determine clinicIds values based on user role
      let clinicIds: string[] = [];

      const clinicIdFromCookie = getClinicId();
      // Try both 'id' and 'clinicId' properties as the API might use either
      const clinicIdFromUser = currentUser?.clinics?.[0]?.id || currentUser?.clinics?.[0]?.clinicId;
      const clinicIdToUse = clinicIdFromCookie || clinicIdFromUser;

      if (isClinicAdmin && clinicIdToUse) {
        // For Clinic Admin, always use their clinic ID (from cookies or user object)
        clinicIds = [clinicIdToUse];
      } else if ((userType?.isAdmin || currentUser?.roleName === 'Administrator') && values.clinicIds && values.clinicIds.length > 0) {
        // For Administrator users, use the selected clinics
        clinicIds = values.clinicIds;
      }

      // Use consistent API structure for all user types
      const payload = {
        email: values.email,
        passwordHash: values.passwordHash,
        firstName: values.firstName,
        lastName: lastName ? lastName : null,
        roleId: roleToSend?.id,
        companyId: userType?.isSuperAdmin ? values.companyId : (currentUser?.companyId || companyId),
        clinicIds: clinicIds, // Array of clinic IDs
        slots: [] // Empty slots array as per API
      };

      await createUser.mutateAsync(payload as any);

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

          {showRoleField && (
            <FormField name="role" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Combobox
                    options={roleOptions}
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Only reset clinic IDs if not a clinicAdmin
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

          {showCompanyField && (
            <FormField name="companyId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Combobox
                    options={companiesData?.map((company: any) => ({
                      value: company.id,
                      label: company.name
                    })) || []}
                    value={field.value || ""}
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

          {showClinicField && !isClinicAdmin && (
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
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
} 
