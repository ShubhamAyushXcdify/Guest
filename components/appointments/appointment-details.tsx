"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Pencil } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// Define the form schema
const appointmentSchema = z.object({
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

type AppointmentFormValues = z.infer<typeof appointmentSchema>

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

interface AppointmentDetailsProps {
  appointmentId: string
  onClose: () => void
}

export default function AppointmentDetails({ appointmentId, onClose }: AppointmentDetailsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const { data: appointment, isLoading } = useGetAppointmentById(appointmentId)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
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

  // Update form values when appointment data is loaded
  useEffect(() => {
    if (appointment) {
      form.reset(appointment)
    }
  }, [appointment, form])

  const onSubmit = (data: AppointmentFormValues) => {
    // TODO: Implement update appointment mutation
    toast({
      title: "Success",
      description: "Appointment updated successfully",
    })
    setIsEditing(false)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "In Room":
        return "theme-badge-info"
      case "Completed":
        return "theme-badge-success"
      case "In Progress":
        return "theme-badge-warning"
      case "Scheduled":
        return "theme-badge-neutral"
      default:
        return "theme-badge-neutral"
    }
  }

//   if (isLoading) {
//     return null
//   }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Appointment Details</SheetTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {!isEditing ? (
          // View Mode
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clinic</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {mockData.clinics.find(c => c.value === appointment?.clinicId)?.label}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {mockData.patients.find(p => p.value === appointment?.patientId)?.label}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {mockData.clients.find(c => c.value === appointment?.clientId)?.label}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Veterinarian</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {mockData.veterinarians.find(v => v.value === appointment?.veterinarianId)?.label}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Room</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {mockData.rooms.find(r => r.value === appointment?.roomId)?.label}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Appointment Type</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {mockData.appointmentTypes.find(t => t.value === appointment?.appointmentType)?.label}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{appointment?.appointmentDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment?.startTime} - {appointment?.endTime}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <Badge className={getStatusBadgeClass(appointment?.status || "")}>
                  {appointment?.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason</h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{appointment?.reason}</p>
              </div>
              {appointment?.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{appointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Edit Mode
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
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="theme-button text-white">
                  Save Changes
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  )
} 