import React, { useEffect, useState } from 'react'
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
import { useGetClinic } from "@/queries/clinic/get-clinic"
import { useGetPatients, Patient } from "@/queries/patients/get-patients"
import { useGetClients, Client } from "@/queries/clients/get-client"
import { useGetRoom, Room } from "@/queries/rooms/get-room"
import { useGetUsers } from "@/queries/users/get-users"
import { NewPatientForm } from "@/components/patients/new-patient-form"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useRootContext } from '@/context/RootContext'

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

interface NewAppointmentProps {
  isOpen: boolean
  onClose: () => void
}

function NewAppointment({ isOpen, onClose }: NewAppointmentProps) {
  const { toast } = useToast()
  const { user, userType, clinic } = useRootContext()
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)

  // Fetch real data from APIs
  const { data: clinics } = useGetClinic(1, 100)
  const { data: patientsResponse, refetch: refetchPatients } = useGetPatients(1, 100)
  const { data: clients } = useGetClients(1, 100)
  const { data: rooms } = useGetRoom(1, 100)

  // Fetch users and filter veterinarians
  const { data: usersResponse = { items: [] } } = useGetUsers(1, 100);
  const veterinarianOptions = (usersResponse.items || [])
    .filter(user => user.roleName === "Veterinarian")
    .map(vet => ({
      value: vet.id,
      label: `Dr. ${vet.firstName} ${vet.lastName}`
    }));

  // Transform API data into Combobox format
  const clinicOptions = (clinics?.items || []).map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }))

  const patientOptions = (patientsResponse?.items || []).map((patient: Patient) => ({
    value: patient.id,
    label: `${patient.name} (${patient.species})`
  }))

  const clientOptions = (clients?.items || []).map((client: Client) => ({
    value: client.id,
    label: `${client.firstName} ${client.lastName}`
  }))

  const roomOptions = (rooms?.items || []).map((room: Room) => ({
    value: room.id,
    label: `${room.name} (${room.roomType})`
  }))

  // Keep the appointment types as is since they're static
  const appointmentTypes = [
    { value: "checkup", label: "Check-up" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery" }
  ]

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
      createdBy: "03621acc-2772-4a42-8951-dd1c50e976fe"
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
    // Format the date and time for the API according to the new payload structure
    const appointmentDateString = data.appointmentDate;
    const startTimeString = data.startTime; // Assuming HH:mm from input type="time"
    const endTimeString = data.endTime;   // Assuming HH:mm from input type="time"

    // Create Date objects to easily format to ISO string without milliseconds and Z
    const appointmentDate = new Date(appointmentDateString);
    // Need to handle potential timezone issues here or rely on API handling
    const formattedAppointmentDate = appointmentDate.toISOString().split('.')[0]; // YYYY-MM-DDTHH:mm:ss

    const formattedData = {
      ...data,
      appointmentDate: formattedAppointmentDate,
      // Append :00 for seconds as required by the example payload
      startTime: `${startTimeString}:00`,
      endTime: `${endTimeString}:00`,
      // createdBy is already correctly set in defaultValues
    }
    createAppointment(formattedData)
  }

  const handlePatientCreated = async () => {
    // Refetch patients to get the updated list
    await refetchPatients()

    // Get the latest patient from the response
    const latestPatient = patientsResponse?.items?.[patientsResponse.items.length - 1]

    if (latestPatient) {
      // Set the new patient as selected
      form.setValue("patientId", latestPatient.id)
      setShowNewPatientForm(false)

      toast({
        title: "Patient added",
        description: `${latestPatient.name} has been added successfully.`,
      })
    }
  }

  const handleCancel = () => {
    setShowNewPatientForm(false)
    onClose()
  }

  const handleClinicDefaultState = () => {
    if (clinic.id && !userType.isAdmin && !userType.isSuperAdmin) {
      form.setValue("clinicId", clinic.id)
    }
  }

  useEffect(() => {
    handleClinicDefaultState()
  }, [clinic])

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent className={`w-[90%] sm:!max-w-full md:!max-w-[${showNewPatientForm ? '70%' : '50%'}] lg:!max-w-[${showNewPatientForm ? '70%' : '50%'}] overflow-x-hidden overflow-y-auto transition-all duration-300`}>
        <SheetHeader>
          <SheetTitle>New Appointment</SheetTitle>
        </SheetHeader>

        <div className="flex gap-6 mt-6">
          {/* Appointment Form Section */}
          <div className={`flex-1 ${showNewPatientForm ? 'w-1/2' : 'w-full'}`}>
            <Form {...form}>
              <form onSubmit={(e) => {
                form.handleSubmit(onSubmit)(e);
              }} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-6">
                  {!clinic.id && (
                    <FormField
                      control={form.control}
                      name="clinicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic</FormLabel>
                          <FormControl>
                            <Combobox
                              options={clinicOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select clinic"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Combobox
                                options={patientOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select patient"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => setShowNewPatientForm(!showNewPatientForm)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <FormControl>
                          <Combobox
                            options={clientOptions}
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
                            options={veterinarianOptions}
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
                            options={roomOptions}
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
                            options={appointmentTypes}
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
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" className="theme-button text-white" disabled={isPending || showNewPatientForm}>
                    {isPending ? "Creating..." : "Create Appointment"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </div>

          {/* New Patient Form Section */}
          {showNewPatientForm && (
            <div className="w-1/2 border-l pl-6">
              <h3 className="text-lg font-semibold mb-4">Add New Patient</h3>
              <NewPatientForm onSuccess={handlePatientCreated} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default NewAppointment
