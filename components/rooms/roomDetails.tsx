import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useGetRoomById } from "@/queries/rooms/get-room-by-id";
import { useUpdateRoom } from "@/queries/rooms/update-room";
import { toast } from "../ui/use-toast";
import { useEffect } from "react";
import { Room } from ".";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  
    const form = useForm<Omit<Room, "id" | "clinicId" | "createdAt">>({
      defaultValues: room,
    });
  
    useEffect(() => {
      if (room) {
        form.reset(room);
      }
    }, [room, form]);
  
    if (isLoading) {
      return <div>Loading...</div>;
    }
  
    if (!room) {
      return <div>Room not found</div>;
    }
  
    const handleSubmit = async (values: Omit<Room, "id" | "clinicId" | "createdAt">) => {
      try {
        await updateRoom.mutateAsync({ id: roomId, data: values });
      } catch (error) {
        // Error handled in onError
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
  
            <FormField name="roomType" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
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
  
            <FormField name="isActive" control={form.control} render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormLabel>Active</FormLabel>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                  />
                </FormControl>
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