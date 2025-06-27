import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateAppointmentType } from "@/queries/appointmentType/create-appointmentType";
import { toast } from "@/components/ui/use-toast";
import { AppointmentType } from "@/queries/appointmentType/get-appointmentType";

type NewAppointmentTypeProps = {
  clinicId?: string;
  onSuccess?: () => void;
};

export default function NewAppointmentType({ clinicId, onSuccess }: NewAppointmentTypeProps) {
  const router = useRouter();
  
  const createAppointmentType = useCreateAppointmentType({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment type created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/clinic");
      }
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: "Failed to create appointment type",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<Omit<AppointmentType, "appointmentTypeId">>({
    defaultValues: {
      name: "",
      clinicId: clinicId || "",
    },
  });
  
  const handleSubmit = async (values: Omit<AppointmentType, "appointmentTypeId">) => {
    try {
      await createAppointmentType.mutateAsync({
        ...values,
        isActive: true, 
      });
    } catch (error) {
      // Error is handled in onError callback
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-12 w-full pt-4">
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
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="submit">
            Create Appointment Type
          </Button>
        </div>
      </form>
    </Form>
  );
}
