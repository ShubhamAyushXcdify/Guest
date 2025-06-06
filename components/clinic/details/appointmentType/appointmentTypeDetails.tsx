'use client';

import { useState, useEffect } from "react";
import { useGetAppointmentTypeById } from "@/queries/appointmentType/get-by-id-appointmentType";
import { useUpdateAppointmentType } from "@/queries/appointmentType/update-appointmentType";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

interface AppointmentTypeDetailsProps {
  appointmentTypeId: string;
  clinicId: string;
  onSuccess?: () => void;
}

export default function AppointmentTypeDetails({ appointmentTypeId, clinicId, onSuccess }: AppointmentTypeDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: appointmentType, isLoading } = useGetAppointmentTypeById(appointmentTypeId);
  
  const updateAppointmentType = useUpdateAppointmentType({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment type updated successfully",
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: "Failed to update appointment type",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (appointmentType) {
      console.log("Appointment type details:", appointmentType);
      form.reset({
        name: appointmentType.name,
      });
    }
  }, [appointmentType, form]);

  const handleSubmit = async (values: any) => {
    if (!appointmentType) return;
    
    setIsUpdating(true);
    try {
      await updateAppointmentType.mutateAsync({
        id: appointmentTypeId,
        data: {
          appointmentTypeId: appointmentTypeId,
          ...values,
          clinicId: clinicId,
        },
      });
    } catch (error) {
      // Error is handled in onError callback
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!appointmentType) {
    return <div>Appointment type not found</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Appointment Type"}
        </Button>
      </form>
    </Form>
  );
}
