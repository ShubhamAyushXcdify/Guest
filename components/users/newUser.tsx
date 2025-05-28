'use client';

import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCreateUser } from "@/queries/users/create-user";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { User } from ".";

type UserFormValues = Omit<User, "id" | "lastLogin" | "createdAt" | "updatedAt">;

// const roles = [
//   { id: "admin", name: "Admin", value: "admin" },
//   { id: "clinicAdmin", name: "Clinic Admin", value: "clinicAdmin" },
//   { id: "veterinarian", name: "Veterinarian", value: "veterinarian" },
//   { id: "receptionist", name: "Receptionist", value: "receptionist" },
//   { id: "supplier", name: "Supplier", value: "supplier" },
//   { id: "patient", name: "Patient", value: "patient" },
//   { id: "client", name: "Client", value: "client" }
// ];


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

interface NewUserProps {
  onSuccess?: () => void;
}

export default function NewUser({ onSuccess }: NewUserProps) {
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
        router.push("/users");
      }
    },
    onError: (error) => {
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
  
  const handleSubmit = async (values: UserFormValues) => {
    try {
      await createUser.mutateAsync(values);
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
              <FormControl><Input {...field} type="password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField name="role" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        
          <FormField name="isActive" control={form.control} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
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
            Create User
          </Button>
        </div>
      </form>
    </Form>
  );
} 