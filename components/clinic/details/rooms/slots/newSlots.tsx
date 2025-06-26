'use client'
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { useCreateSlot } from "@/queries/slots/create-slot";

// Schema for slot validation
const slotSchema = z.object({
  clinicId: z.string({
    required_error: "Clinic ID is required",
  }),
  roomId: z.string({
    required_error: "Room ID is required",
  }),
  startTime: z.string({
    required_error: "Start time is required",
  }),
  endTime: z.string({
    required_error: "End time is required",
  }),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    if (!data.startTime || !data.endTime) return true;
    return data.startTime < data.endTime;
  },
  {
    message: "Start time must be less than end time",
    path: ["endTime"],
  }
);

type SlotFormValues = z.infer<typeof slotSchema>;

type NewSlotsProps = {
  roomId: string;
  clinicId?: string;
  onSuccess?: () => void;
};

export default function NewSlots({ roomId, clinicId, onSuccess }: NewSlotsProps) {
  const createSlot = useCreateSlot({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Slot added successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add slot: " + error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<any>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      clinicId: clinicId || '',
      roomId: roomId,
      startTime: "",
      endTime: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: any) => {
    try {
      // Always send isAvailable: true, do not send durationMinutes
      await createSlot.mutateAsync({ ...values, isAvailable: true });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createSlot.isPending}>
          {createSlot.isPending ? "Adding..." : "Add Slot"}
        </Button>
      </form>
    </Form>
  );
}
