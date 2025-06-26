'use client'
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { useGetSlotById } from "@/queries/slots/get-slot-by-id";
import { useUpdateSlot } from "@/queries/slots/update-slot";

// Schema for slot validation
const slotSchema = z.object({
  id: z.string(),
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
});

type SlotFormValues = z.infer<typeof slotSchema>;

type SlotDetailsProps = {
  slotId: string;
  roomId: string;
  clinicId?: string;
  onSuccess?: () => void;
};

export default function SlotDetails({ slotId, roomId, clinicId, onSuccess }: SlotDetailsProps) {
  const { data: slot, isLoading } = useGetSlotById(slotId);
  const updateSlot = useUpdateSlot({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Slot updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update slot: " + error.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<any>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      id: slotId,
      clinicId: clinicId || '',
      roomId: roomId,
      startTime: "",
      endTime: "",
      isActive: true,
    },
  });

  // Format time for form (e.g., convert "2023-01-01T09:00:00" to "09:00")
  const formatTimeForForm = (timeString: string): string => {
    if (!timeString) return '';
    
    // If time is already in HH:MM format, return as is
    if (timeString.length <= 5) return timeString;
    
    // Otherwise, try to parse and format
    try {
      return timeString.split('T')[1]?.substring(0, 5) || timeString;
    } catch (e) {
      return timeString;
    }
  };

  useEffect(() => {
    if (slot) {
      form.reset({
        id: slotId,
        clinicId: slot.clinicId || clinicId || '',
        roomId: roomId,
        startTime: formatTimeForForm(slot.startTime || ''),
        endTime: formatTimeForForm(slot.endTime || ''),
        isActive: slot.isActive ?? true,
      });
    }
  }, [slot, form, roomId, slotId, clinicId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!slot) {
    return <div>Slot not found</div>;
  }

  const onSubmit = async (values: any) => {
    try {
      await updateSlot.mutateAsync({
        id: slotId,
        data: { ...values }, // do not send durationMinutes or isAvailable
      });
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

        <Button type="submit" className="w-full" disabled={updateSlot.isPending}>
          {updateSlot.isPending ? "Updating..." : "Update Slot"}
        </Button>
      </form>
    </Form>
  );
}
