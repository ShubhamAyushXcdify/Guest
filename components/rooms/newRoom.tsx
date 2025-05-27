import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCreateRoom } from "@/queries/rooms/create-room";
import { toast } from "../ui/use-toast";
import { Room } from "./index";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type NewRoomProps = {
  clinicId?: string;
  onSuccess?: () => void;
};

export default function NewRoom({ clinicId, onSuccess }: NewRoomProps) {
  const router = useRouter();
  
  const createRoom = useCreateRoom({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/clinic");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<Omit<Room, "id" | "createdAt">>({
    defaultValues: {
      name: "",
      clinicId: clinicId || "",
      roomType: "",
      isActive: true,
    },
  });
  
  const handleSubmit = async (values: Omit<Room, "id" | "createdAt">) => {
    try {
      await createRoom.mutateAsync(values);
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full">
        <div className="grid grid-cols-1 gap-8">
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          {!clinicId && (
            <FormField name="clinicId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Clinic ID</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          )}
          
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
            Create Room
          </Button>
        </div>
      </form>
    </Form>
  );
} 