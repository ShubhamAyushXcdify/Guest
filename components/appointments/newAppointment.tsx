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
import { DatePicker } from "@/components/ui/datePicker"
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
import { useGetRoomsByClinicId } from "@/queries/rooms/get-room-by-clinic-id"
import { useGetPatientsByClinicId } from "@/queries/patients/get-patient-by-clinic-id"

// Define the form schema
const newAppointmentSchema = z.object({
  clinicId: z.string().uuid("Please select a clinic"),
  patientId: z.string().uuid("Please select a patient"),
  veterinarianId: z.string().uuid("Please select a veterinarian"),
  roomId: z.string().uuid("Please select a room"),
  appointmentDate: z.date().refine(date => !!date, "Please select an appointment date"),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().min(1, "Please select an end time"),
  appointmentType: z.string().min(1, "Please select an appointment type"),
  reason: z.string().min(1, "Please provide a reason for the appointment"),
  status: z.string(),
  notes: z.string().optional(),
})

type NewAppointmentFormValues = z.infer<typeof newAppointmentSchema>

interface NewAppointmentProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialPatientId?: string;
  initialClinicId?: string;
  onSuccess?: () => void;
}

function NewAppointment({ isOpen, onClose, initialPatientId, initialClinicId, onSuccess }: NewAppointmentProps) {
  const { toast } = useToast()
  const { user, userType, clinic } = useRootContext()
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const form = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      clinicId: initialClinicId || "",
      patientId: initialPatientId || "",
      veterinarianId: "",
      roomId: "",
      appointmentDate: undefined,
      startTime: "",
      endTime: "",
      appointmentType: "",
      reason: "",
      status: "scheduled",
      notes: "",
    },
  })

  // Fetch real data from APIs
  const { data: clinics } = useGetClinic(1, 100)
  const selectedClinicId = form.watch("clinicId") || clinic?.id || "";

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
  
  const { data: patientsResponse, refetch: refetchPatients } = useGetPatientsByClinicId(selectedClinicId);
  const { data: rooms, isLoading: isLoadingRooms } = useGetRoomsByClinicId(selectedClinicId);
  
  const roomOptions = isLoadingRooms 
  ? [] 
  : (rooms || []).map((room: any) => ({
    value: room.id,
    label: `${room.name} (${room.roomType})`
  }));
  
  const patientOptions = (patientsResponse || []).map((patient: Patient) => ({
    value: patient.id,
    label: `${patient.name} (${patient.species})`,
    clientId : patient.clientId
  }))
  const appointmentTypes = [
    { value: "checkup", label: "Check-up" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery" }
  ]

  const { mutate: createAppointment, isPending } = useCreateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
      if (onSuccess) {
        onSuccess();
      } else if (onClose) {
        onClose();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    }
  })
// Handle form validation errors
  const onSubmit = (data: NewAppointmentFormValues) => {
    try {
      const startTimeString = data.startTime;
      const endTimeString = data.endTime;

      // appointmentDate is already a Date object now
      if (!data.appointmentDate) {
        throw new Error("Appointment date is required");
      }
      const formattedAppointmentDate = data.appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const selectedPatient = patientOptions?.find((p:any) => p.value === data.patientId);
      if (!selectedPatient) {
        throw new Error("Selected patient not found");
      }

      const formattedData = {
        ...data,
        clientId: selectedPatient.clientId, // Use the patient's client ID
        appointmentDate: formattedAppointmentDate,
        startTime: `${startTimeString}:00`,
        endTime: `${endTimeString}:00`,
        createdBy: user?.id,
      }
      createAppointment(formattedData)
    } catch (error) {
      console.log("ASdasdasd")
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: "Validation Error",
            description: `${err.path.join('.')}: ${err.message}`,
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  }

  const handlePatientCreated = async () => {
    await refetchPatients()
    const latestPatient = patientsResponse?.items?.[patientsResponse.items.length - 1]
    if (latestPatient) {
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
    if (onClose) onClose()
  }

  const handleClinicDefaultState = () => {
    if (initialClinicId) {
      form.setValue("clinicId", initialClinicId)
    } else if (clinic.id && !userType.isAdmin && !userType.isSuperAdmin) {
      form.setValue("clinicId", clinic.id)
    }
  }

  useEffect(() => {
    handleClinicDefaultState()
  }, [clinic, initialClinicId])

  useEffect(() => {
    if (initialPatientId) {
      form.setValue("patientId", initialPatientId)
    }
  }, [initialPatientId, form])
  
  // Set default appointment date to today when component mounts
  useEffect(() => {
    form.setValue("appointmentDate", new Date());
  }, []);

  return (
    <Sheet open={isOpen || false} onOpenChange={handleCancel}>
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
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // Find the selected patient to get the client info
                                  const selectedPatient = patientsResponse?.items?.find((p: Patient) => p.id === value);
                                  if (selectedPatient) {
                                    toast({
                                      title: "Client Selected",
                                      description: `Client: ${selectedPatient.clientId}`,
                                    });
                                  }
                                }}
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
                            placeholder={isLoadingRooms ? "Loading rooms..." : "Select room"}
                            // disabled={isLoadingRooms || !selectedClinicId}
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
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
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
