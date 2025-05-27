import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useCreateAppointment } from "@/queries/appointment"
import { useToast } from "@/components/ui/use-toast"

// Define the form schema
const newAppointmentSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  clientId: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  roomId: z.string().uuid(),
  appointmentDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  appointmentType: z.string(),
  reason: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  createdBy: z.string().uuid()
})

type NewAppointmentFormValues = z.infer<typeof newAppointmentSchema>

// Mock data for dropdowns - replace with actual data from your API
const mockData = {
  clinics: [
    { value: "clinic1", label: "Main Clinic" },
    { value: "clinic2", label: "Branch Clinic" }
  ],
  patients: [
    { value: "patient1", label: "Max (Dog)" },
    { value: "patient2", label: "Bella (Cat)" }
  ],
  clients: [
    { value: "client1", label: "John Doe" },
    { value: "client2", label: "Jane Smith" }
  ],
  veterinarians: [
    { value: "vet1", label: "Dr. Smith" },
    { value: "vet2", label: "Dr. Johnson" }
  ],
  rooms: [
    { value: "room1", label: "Exam Room 1" },
    { value: "room2", label: "Exam Room 2" }
  ],
  appointmentTypes: [
    { value: "checkup", label: "Check-up" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery" }
  ]
}

interface NewAppointmentProps {
  isOpen: boolean
  onClose: () => void
}

function NewAppointment({ isOpen, onClose }: NewAppointmentProps) {
  const { toast } = useToast()
  const form = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      clinicId: "",
      patientId: "",
      clientId: "",
      veterinarianId: "",
      roomId: "",
      appointmentDate: "",
      startTime: "",
      endTime: "",
      appointmentType: "",
      reason: "",
      status: "scheduled",
      notes: "",
      createdBy: "" // This should be set from your auth context
    },
  })

  const { mutate: createAppointment, isPending } = useCreateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment created successfully",
      })
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      })
    }
  })

  const onSubmit = (data: NewAppointmentFormValues) => {
    createAppointment(data)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:!max-w-full md:!max-w-[60%] lg:!max-w-[60%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Appointment</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clinicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic</FormLabel>
                    <FormControl>
                      <Combobox
                        options={mockData.clinics}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select clinic"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <FormControl>
                      <Combobox
                        options={mockData.patients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select patient"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Combobox
                        options={mockData.clients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select client"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="veterinarianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinarian</FormLabel>
                    <FormControl>
                      <Combobox
                        options={mockData.veterinarians}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select veterinarian"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <FormControl>
                      <Combobox
                        options={mockData.rooms}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select room"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <FormControl>
                      <Combobox
                        options={mockData.appointmentTypes}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select appointment type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="theme-button text-white" disabled={isPending}>
                {isPending ? "Creating..." : "Create Appointment"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default NewAppointment
