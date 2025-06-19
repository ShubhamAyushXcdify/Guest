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
import { Plus, Search, X, Loader2 } from "lucide-react"
import { useRootContext } from '@/context/RootContext'
import { useGetRoomsByClinicId } from "@/queries/rooms/get-room-by-clinic-id"
import { useGetPatientsByClinicId } from "@/queries/patients/get-patient-by-clinic-id"
import { useSearchPatients } from "@/queries/patients/get-patients-by-search"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetSlotByRoomId, Slot } from "@/queries/slots/get-slot-by-roomId"

// Extended patient interface to handle API response variations
interface SearchPatientResult {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  patientId?: string;
  species?: string;
  clientId?: string;
  clientFirstName?: string;
  clientLastName?: string;
  client?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  }
}

// Define the form schema
const newAppointmentSchema = z.object({
  clinicId: z.string().uuid("Please select a clinic"),
  patientId: z.string().uuid("Please select a patient"),
  veterinarianId: z.string().uuid("Please select a veterinarian"),
  roomId: z.string().uuid("Please select a room"),
  appointmentDate: z.date().refine(date => !!date, "Please select an appointment date"),
  slotId: z.string().min(1, "Please select a slot"),
  appointmentType: z.string().min(1, "Please select an appointment type"),
  reason: z.string().min(1, "Please provide a reason for the appointment"),
  status: z.string(),
  notes: z.string().optional(),
})

type NewAppointmentFormValues = z.infer<typeof newAppointmentSchema>

interface NewAppointmentProps {
  isOpen: boolean
  onClose: () => void
  patientId?: string
}

// Define the SlotResponse interface to match your API
interface SlotResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: Slot[];
}

function NewAppointment({ isOpen, onClose, patientId }: NewAppointmentProps) {
  const { toast } = useToast()
  const { user, userType, clinic } = useRootContext()
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  // Patient search state
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const debouncedPatientQuery = useDebounce(patientSearchQuery, 300)
  const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string, clientId?: string } | null>(null)
  
  // Use patient search query
  const { data: searchResults = [], isLoading: isSearching } = useSearchPatients(
    debouncedPatientQuery,
    "name" // Always search by name as specified
  )
  
  // Cast the search results to our custom interface to handle API variations
  const typedSearchResults = searchResults as SearchPatientResult[];
  
  const form = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(newAppointmentSchema),
    defaultValues: {
      clinicId: "",
      patientId: "",
      veterinarianId: "",
      roomId: "",
      appointmentDate: undefined,
      slotId: "",
      appointmentType: "",
      reason: "",
      status: "scheduled",
      notes: "",
    },
  })

  // Get selected room ID for slots
  const selectedRoomId = form.watch("roomId");
  const selectedDate = form.watch("appointmentDate");

  // Format selected date to YYYY-MM-DD for API filtering (if needed later)
  const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

  // Fetch slots for the selected room
  const { data: slotsData, isLoading: isLoadingSlots } = useGetSlotByRoomId(1, 100, '', selectedRoomId);
  
  // Initialize slots with proper default value
  const slots: SlotResponse = slotsData || { pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0, items: [] };

  // Format time for display (assuming HH:mm:ss format from API)
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    // If time is already in HH:MM format, return as is
    if (timeString.length <= 5) return timeString;
    
    // Try to parse and format to HH:MM
    try {
      // Handle ISO format (2023-06-01T11:00:00)
      if (timeString.includes('T')) {
        return timeString.split('T')[1].substring(0, 5);
      }
      
      // Handle HH:MM:SS format
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':');
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      
      return timeString;
    } catch (e) {
      return timeString;
    }
  };

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
  
  // Handle selecting a patient from search results
  const handlePatientSelect = (patient: SearchPatientResult) => {
    // Determine the correct patient name based on different possible API structures
    let patientName = '';
    
    if (patient.name) {
      patientName = patient.name;
    } 
    else if (patient.patientId) {
      patientName = patient.patientId;
      if (patient.species) {
        patientName += ` (${patient.species})`;
      }
    }
    else if (patient.firstName || patient.lastName) {
      patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    }
    
    if (!patientName) {
      patientName = `Patient (ID: ${patient.id.substring(0, 8)}...)`;
    }
    
    // Get client ID - check both possible locations based on API structure
    const clientId = patient.clientId || patient.client?.id;
    
    // Always select the patient
    setSelectedPatient({
      id: patient.id,
      name: patientName,
      clientId: clientId
    });
    
    form.setValue("patientId", patient.id);
    setPatientSearchQuery(""); // Clear the search input
    setIsSearchDropdownOpen(false); // Close the dropdown
    
    if (clientId) {
      // Show client information
      let clientName = "";
      if (patient.client) {
        clientName = `${patient.client.firstName || ''} ${patient.client.lastName || ''}`.trim();
      } else if (patient.clientFirstName || patient.clientLastName) {
        clientName = `${patient.clientFirstName || ''} ${patient.clientLastName || ''}`.trim();
      }
      
      toast({
        title: "Patient Selected",
        description: `Client: ${clientName || 'Unknown Client'}`,
      });
    } else {
      // Show warning that client ID is missing
      toast({
        title: "Warning: Missing Client Information",
        description: "This patient doesn't have an associated client. You'll need to provide client info before creating an appointment.",
        variant: "destructive", 
      });
    }
  }

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
    form.setValue("slotId", slotId);
  };
  
  // Handle form validation errors
  const onSubmit = (data: NewAppointmentFormValues) => {
    try {
      // appointmentDate is already a Date object now
      if (!data.appointmentDate) {
        throw new Error("Appointment date is required");
      }
      const formattedAppointmentDate = data.appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Check for the selected patient
      if (!selectedPatient) {
        toast({
          title: "Patient Required",
          description: "Please select a patient for this appointment.",
          variant: "destructive",
        });
        return;
      }
      
      // Try to get client ID from the selected patient
      let clientId = selectedPatient.clientId;
      
      // If no client ID yet, check if we can find this patient in our patients list
      if (!clientId && patientsResponse) {
        const patientId = selectedPatient.id;
        // Find the patient in our full patient data
        const fullPatientData = patientsResponse.find((p: any) => p.id === patientId);
        
        if (fullPatientData && fullPatientData.clientId) {
          clientId = fullPatientData.clientId;
          
          // Update the selected patient with the client ID for future reference
          setSelectedPatient({
            ...selectedPatient,
            clientId: clientId
          });
        }
      }
      
      if (!clientId) {
        toast({
          title: "Missing Client Information",
          description: "To create an appointment, this patient must have an associated client. Please update the patient record first.",
          variant: "destructive",
        });
        return; // Prevent form submission
      }

      // Find selected slot details
      const selectedSlotDetails = slots.items.find(slot => slot.id === data.slotId);
      
      if (!selectedSlotDetails) {
        toast({
          title: "Error",
          description: "Selected slot information not found",
          variant: "destructive",
        });
        return;
      }

      const formattedData = {
        ...data,
        clientId,
        appointmentDate: formattedAppointmentDate,
        roomSlotId: data.slotId, // Use slotId as roomSlotId
        createdBy: user?.id,
      };
      
      createAppointment(formattedData);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: "Validation Error",
            description: `${err.path.join('.')}: ${err.message}`,
            variant: "destructive",
          });
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
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
      
      // Update the selected patient state
      setSelectedPatient({
        id: latestPatient.id,
        name: latestPatient.name,
        clientId: latestPatient.clientId
      });
      
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

  useEffect(() => {
    if (patientId) {
      form.setValue("patientId", patientId);
      
      // Find the selected patient in the response to set the selected patient state
      const patient = patientsResponse?.find((p: Patient) => p.id === patientId);
      if (patient) {
        setSelectedPatient({
          id: patient.id,
          name: patient.name,
          clientId: patient.clientId
        });
      }
    }
  }, [patientId, form, patientsResponse]);
  
  // Set default appointment date to today when component mounts
  useEffect(() => {
    form.setValue("appointmentDate", new Date());
  }, []);

  // Clear the selected patient
  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    form.setValue("patientId", "");
  }

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
                              <div className="relative flex-grow">
                                {selectedPatient ? (
                                  <div className="flex items-center justify-between p-2 border rounded-md">
                                    <span>{selectedPatient.name}</span>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-1 h-auto"
                                      onClick={clearSelectedPatient}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="relative w-full">
                                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                      <Input
                                        placeholder="Search patients by name"
                                        className="pl-10"
                                        value={patientSearchQuery}
                                        onChange={(e) => {
                                          setPatientSearchQuery(e.target.value);
                                          setIsSearchDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsSearchDropdownOpen(true)}
                                      />
                                    </div>
                                    
                                    {/* Search results dropdown */}
                                    {isSearchDropdownOpen && patientSearchQuery && (
                                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {isSearching ? (
                                          <div className="p-2 text-center text-gray-500">Searching...</div>
                                        ) : searchResults.length === 0 ? (
                                          <div className="p-2 text-center text-gray-500">No patients found</div>
                                        ) : (
                                          <ul>
                                            {typedSearchResults.map((patient) => {
                                              // Determine the display name
                                              // Different possible structures for patient name in the API response
                                              
                                              // Direct name property (some API responses)
                                              let displayName = '';
                                              
                                              if (patient.name) {
                                                displayName = patient.name;
                                              } 
                                              // Animal patient (may have species)
                                              else if (patient.patientId) {
                                                displayName = patient.patientId;
                                                if (patient.species) {
                                                  displayName += ` (${patient.species})`;
                                                }
                                              }
                                              // Human patient with first/last name
                                              else if (patient.firstName || patient.lastName) {
                                                displayName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                                              }
                                              
                                              // If we still don't have a display name, use the ID as last resort
                                              if (!displayName) {
                                                console.warn('No name found for patient:', patient);
                                                displayName = `Patient (ID: ${patient.id.substring(0, 8)}...)`;
                                              }
                                              
                                              return (
                                                <li
                                                  key={patient.id}
                                                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                                  onClick={() => handlePatientSelect(patient)}
                                                >
                                                  <div className="font-medium">{displayName}</div>
                                                  {patient.client && (
                                                    <div className="text-sm text-gray-500">
                                                      Owner: {patient.client.firstName || ''} {patient.client.lastName || ''}
                                                    </div>
                                                  )}
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={() => setShowNewPatientForm(!showNewPatientForm)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <input type="hidden" {...field} />
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
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset selected slot when room changes
                              setSelectedSlot(null);
                              form.setValue("slotId", "");
                            }}
                            placeholder={isLoadingRooms ? "Loading rooms..." : "Select room"}
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
                </div>

                {/* Slot selection section - only appears when room is selected */}
                {selectedRoomId && (
                  <FormField
                    control={form.control}
                    name="slotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Slots</FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            {isLoadingSlots ? (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading available slots...
                              </div>
                            ) : slots.items.length === 0 ? (
                              <div className="text-sm text-gray-500">
                                No slots available for this room
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {slots.items
                                  .filter(slot => slot.isAvailable)
                                  .map((slot: Slot) => (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => handleSlotClick(slot.id)}
                                    className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                                      selectedSlot === slot.id
                                        ? 'bg-green-100 border-green-300 text-green-800'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    {formatTime(slot.startTime)}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input type="hidden" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
