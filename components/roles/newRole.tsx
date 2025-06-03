'use client';

import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { useCreateRole } from "@/queries/roles/create-role";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { Role } from "@/queries/roles/get-role";

type RoleFormValues = {
    name: string;
    value: string;
    isPrivileged: boolean;
    metadata: string; // flexible JSON-like structure
    isClinicRequired: boolean;
  };
  

interface NewRoleProps {
  onSuccess?: () => void;
}

export default function NewRole({ onSuccess }: NewRoleProps) {
  const router = useRouter();
  
  const createRole = useCreateRole({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/roles");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<RoleFormValues>({
    defaultValues: {
      name: "",
      value: "",
      isPrivileged: false,
      metadata: "{}",
      isClinicRequired: false,
    },
  });

  const handleSubmit = async (values: RoleFormValues) => {  
    try {
      await createRole.mutateAsync(values);
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="value" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl><Input {...field} /></FormControl>
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
            Create Role
          </Button>
        </div>
      </form>
    </Form>
  );
}
