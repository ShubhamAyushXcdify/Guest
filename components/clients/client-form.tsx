import { useState,useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Client } from "@/queries/clients/get-client";
import { useCreateClient } from "@/queries/clients/create-client";
import { useUpdateClient } from "@/queries/clients/update-client";
import { useRootContext } from '@/context/RootContext';
import { Mic, Loader2 } from "lucide-react";
import { AudioManager } from "@/components/audioTranscriber/AudioManager";
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber";
import { useToast } from "@/hooks/use-toast";

const clientFormSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phonePrimary: z.string().min(5, { message: "Phone number is required." }),
  phoneSecondary: z.string().optional(),
  addressLine1: z.string().min(1, { message: "Address is required." }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  postalCode: z.string().min(1, { message: "Postal code is required." }),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  defaultValues?: Partial<ClientFormValues>;
  onSuccess?: (client: Client) => void;
  nestedForm?: boolean;
  isUpdate?: boolean;
}

export function ClientForm({
  defaultValues = {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phonePrimary: "",
    phoneSecondary: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    notes: "",
    isActive: true,
  },
  onSuccess,
  nestedForm = false,
  isUpdate = false,
}: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const { clinic } = useRootContext();
  const notesTranscriber = useTranscriber();
  const { toast } = useToast();

  // Audio transcription effect for notes
  useEffect(() => {
    const output = notesTranscriber.output;
    if (output && !output.isBusy && output.text) {
      form.setValue(
        "notes",
        (form.getValues("notes") ? form.getValues("notes") + "\n" : "") + output.text
      );
      setAudioModalOpen(false);
    }
    // eslint-disable-next-line
  }, [notesTranscriber.output?.isBusy]);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      const clientData = {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true
      };
      
      console.log("Form submission - isUpdate:", isUpdate);
      console.log("Form submission - client ID:", data.id);
      console.log("Form submission data:", clientData);
      
      let updatedClient: Client;
      
      // Force update if isUpdate prop is true, regardless of ID
      if (isUpdate) {
        console.log("Using UPDATE mutation - ID:", data.id);
        updatedClient = await updateClientMutation.mutateAsync({
          id: (data.id || defaultValues.id || "") as string,  // Ensure we have the ID with string typecast
          firstName: clientData.firstName,
          lastName: clientData.lastName, 
          email: clientData.email,
          phonePrimary: clientData.phonePrimary,
          phoneSecondary: clientData.phoneSecondary,
          addressLine1: clientData.addressLine1,
          addressLine2: clientData.addressLine2,
          city: clientData.city,
          state: clientData.state,
          postalCode: clientData.postalCode,
          emergencyContactName: clientData.emergencyContactName,
          emergencyContactPhone: clientData.emergencyContactPhone,
          notes: clientData.notes,
          isActive: clientData.isActive
        });
        toast({
          title: "Success",
          description: "Owner updated successfully",
          variant: "success",
        });
      } else {
        console.log("Using CREATE mutation");
        // Otherwise use create mutation
        updatedClient = await createClientMutation.mutateAsync(clientData);
        toast({
          title: "Success",
          description: "Client created successfully",
          variant: "success",
        });
      }
      
      if (onSuccess) {
        onSuccess(updatedClient);
      }
    } catch (error) {
      console.error(`Error ${isUpdate ? "updating" : "creating"} owner:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isUpdate ? "update" : "create"} owner. Please try again.`,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // The form fields content
  const formContent = (
    <div className="space-y-6">
      {/* Hidden ID field for updates */}
      {isUpdate && (
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name*</FormLabel>
              <FormControl>
                <Input placeholder="First name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name*</FormLabel>
              <FormControl>
                <Input placeholder="Last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email*</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phonePrimary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Phone*</FormLabel>
              <FormControl>
                <Input placeholder="Primary phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneSecondary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secondary Phone</FormLabel>
              <FormControl>
                <Input placeholder="Secondary phone" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="addressLine1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 1*</FormLabel>
            <FormControl>
              <Input placeholder="Address line 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressLine2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2</FormLabel>
            <FormControl>
              <Input placeholder="Address line 2" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City*</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State*</FormLabel>
              <FormControl>
                <Input placeholder="State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code*</FormLabel>
              <FormControl>
                <Input placeholder="Postal code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="emergencyContactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact Name</FormLabel>
              <FormControl>
                <Input placeholder="Emergency contact name" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyContactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact Phone</FormLabel>
              <FormControl>
                <Input placeholder="Emergency contact phone" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {isUpdate && (
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
      )}

     <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Notes</FormLabel>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setAudioModalOpen(true)}
                title="Record voice note"
                disabled={notesTranscriber.output?.isBusy}
              >
                {notesTranscriber.output?.isBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            </div>
            <FormControl>
              <Textarea
                placeholder="Any additional notes about the client"
                className="resize-none h-24"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
            <AudioManager
              open={audioModalOpen}
              onClose={() => setAudioModalOpen(false)}
              transcriber={notesTranscriber}
              onTranscriptionComplete={() => setAudioModalOpen(false)}
            />
          </FormItem>
        )}
      />

      <Button
        type="button"
        className={isUpdate ? "bg-green-600 hover:bg-green-700 text-white w-full" : "theme-button text-white w-full"}
        disabled={isSubmitting}
        onClick={(e) => {
          e.preventDefault();
          // Manually trigger form validation and submission
          form.handleSubmit(onSubmit)();
        }}
      >
        {isSubmitting 
          ? (isUpdate ? "Updating..." : "Saving...") 
          : (isUpdate ? "Update Owner" : "Save Owner")
        }
      </Button>
    </div>
  );

  // If this is a nested form, just return the form content without the outer Form and form tags
  if (nestedForm) {
    return (
      <Form {...form}>
        {formContent}
      </Form>
    );
  }

  // Otherwise, return the complete form with the form tag
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formContent}
      </form>
    </Form>
  );
}