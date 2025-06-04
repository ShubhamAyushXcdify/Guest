import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetRoomById } from "@/queries/rooms/get-room-by-id";
import { useUpdateRoom } from "@/queries/rooms/update-room";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define form values explicitly to avoid TypeScript errors
type FormValues = {
  name: string;
  roomType: string;
};

type RoomDetailsProps = {
  roomId: string;
  onSuccess?: () => void;
};

export default function RoomDetails({ roomId, onSuccess }: RoomDetailsProps) {
  const router = useRouter();

  const { data: room, isLoading } = useGetRoomById(roomId);
  const updateRoom = useUpdateRoom({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      });
    }
  });

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      roomType: "",
    },
  });

  useEffect(() => {
    if (room) {
      const roomData = room as any;
      form.reset({
        name: roomData.name || "",
        roomType: roomData.roomType || "",
      });
    }
  }, [room, form]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      // Cast to any to avoid TypeScript errors with the API
      const updateData: any = {
        ...values,
        isActive: true // Always keep active
      };
      
      await updateRoom.mutateAsync({ 
        id: roomId, 
        data: updateData
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full">
        <div className="grid grid-cols-1 gap-8">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="roomType" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Room Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""} 
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="examination">Examination</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="isolation">Isolation</SelectItem>
                  <SelectItem value="recovery">Recovery</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit">
            Update Room
          </Button>
        </div>
      </form>
    </Form>
  );
}