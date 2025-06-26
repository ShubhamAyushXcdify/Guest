"use client"

import { useEffect, useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Pencil, ClipboardList, Search, X, Loader2,Mic } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useGetClinic } from "@/queries/clinic/get-clinic"
import { useGetPatients } from "@/queries/patients/get-patients"
import { useGetClients, Client } from "@/queries/clients/get-client"
import { useGetUsers } from "@/queries/users/get-users"
import { useGetRoom } from "@/queries/rooms/get-room"
import { useUpdateAppointment } from "@/queries/appointment/update-appointment"
import PatientInformation from "@/components/appointments/Patient-Information/index"
import { useSearchPatients } from "@/queries/patients/get-patients-by-search"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetSlotByRoomId, Slot } from "@/queries/slots/get-slot-by-roomId"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"

// Define the form schema
const appointmentSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  clientId: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  roomId: z.string().uuid(),
  appointmentDate: z.string(),
  roomSlotId: z.string(),
  appointmentType: z.string(),
  reason: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  createdBy: z.string().uuid()
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentDetailsProps {
  appointmentId: string
  onClose: () => void
}

// Define a more comprehensive patient interface
interface ExtendedPatient {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  patientId?: string;
  species?: string;
  breed?: string;
}

export default function AppointmentDetails({ appointmentId, onClose }: AppointmentDetailsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isPatientInfoOpen, setIsPatientInfoOpen] = useState(false)
  const { data: appointment, isLoading } = useGetAppointmentById(appointmentId)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  // Patient search state
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<{id: string, name: string} | null>(null)
  const debouncedPatientQuery = useDebounce(patientSearchQuery, 300)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  
  // Initialize form
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clinicId: "",
      patientId: "",
      clientId: "",
      veterinarianId: "",
      roomId: "",
      appointmentDate: "",
      roomSlotId: "",
      appointmentType: "",
      reason: "",
      status: "scheduled",
      notes: "",
      createdBy: "" // This should be set from your auth context
    },
  })
  
  // Get selected room ID for slots
  const selectedRoomId = form.watch("roomId");
  
  // Use patient search query for edit mode
  const { data: searchResults = [], isLoading: isSearching } = useSearchPatients(
    debouncedPatientQuery,
    "name" // Always search by name as specified
  )
  
  // Convert search results to our format
  const typedSearchResults = searchResults as ExtendedPatient[];
  
  // Fetch slots for the selected room
  const { data: slotsData, isLoading: isLoadingSlots } = useGetSlotByRoomId(1, 100, '', selectedRoomId);
  
  // Initialize slots with proper default value
  const slots = slotsData || { pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0, items: [] };
  
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
  
  // Handle clicking outside the search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  // Handle selecting a patient from search
  const handlePatientSelect = (patient: ExtendedPatient) => {
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
      console.warn('No name found for selected patient:', patient);
      patientName = `Patient (ID: ${patient.id.substring(0, 8)}...)`;
    }
    
    setSelectedPatient({
      id: patient.id,
      name: patientName
    });
    
    form.setValue("patientId", patient.id);
    setPatientSearchQuery(""); // Clear the search input
    setIsSearchDropdownOpen(false); // Close the dropdown
  }
  
  // Handle slot selection
  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
    form.setValue("roomSlotId", slotId);
  };
  
  // Clear selected patient
  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    form.setValue("patientId", "");
  }

  // Fetch data from APIs
  const { data: clinicsResponse } = useGetClinic(1, 100)
  const { data: patientsResponse } = useGetPatients(1, 100)
  const { data: clientsResponse } = useGetClients(1, 100)
  const { data: usersResponse } = useGetUsers(1, 100)
  const { data: roomsResponse } = useGetRoom(1, 100)

  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive",
      })
    }
  })

  // Transform data for comboboxes
  const clinicOptions = (clinicsResponse?.items || []).map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }))

  const patientOptions = (patientsResponse?.items || []).map((patient: ExtendedPatient) => {
    // Determine the display name based on available properties
    let displayName = '';
    
    if (patient.name) {
      displayName = patient.name;
    } 
    else if (patient.patientId) {
      displayName = patient.patientId;
      if (patient.species) {
        displayName += ` (${patient.species})`;
      }
    }
    else if (patient.firstName || patient.lastName) {
      displayName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    }
    
    // If we still don't have a display name, use ID as last resort
    if (!displayName) {
      displayName = `Patient (ID: ${patient.id.substring(0, 8)}...)`;
    }
    
    return {
      value: patient.id,
      label: displayName
    }
  })

  const clientOptions = (clientsResponse?.items || []).map((client: Client) => ({
    value: client.id,
    label: `${client.firstName} ${client.lastName}`
  }))

  const veterinarianOptions = (usersResponse?.items || [])
    .filter(user => user.roleName === "Veterinarian")
    .map(vet => ({
      value: vet.id,
      label: `Dr. ${vet.firstName} ${vet.lastName}`
    }))

  const roomOptions = (roomsResponse?.items || []).map(room => ({
    value: room.id,
    label: room.name
  }))

  const appointmentTypeOptions = [
    { value: "Checkup", label: "Check-up" },
    { value: "Vaccination", label: "Vaccination" },
    { value: "Surgery", label: "Surgery" },
    { value: "Consultation", label: "Consultation" },
    { value: "Follow-up", label: "Follow-up" }
  ]

  // Update form values when appointment data is loaded
  useEffect(() => {
    if (appointment) {
      const slotId = appointment.roomSlotId || appointment.slotId || "";
      
      form.reset({
        ...appointment,
        appointmentDate: appointment.appointmentDate.split('T')[0], // Convert to YYYY-MM-DD format
        roomSlotId: slotId, // Handle different field names
      });
      
      // Set the selected slot
      setSelectedSlot(slotId);
      
      // Set the selected patient for the search component
      if (appointment.patientId && appointment.patient) {
        // Determine the display name based on what's available
        let patientName = '';
        
        if (appointment.patient.name) {
          patientName = appointment.patient.name;
        } 
        else if (appointment.patient.patientId) {
          patientName = appointment.patient.patientId;
          if (appointment.patient.species) {
            patientName += ` (${appointment.patient.species})`;
          }
        }
        else if (appointment.patient.firstName || appointment.patient.lastName) {
          patientName = `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim();
        }
        
        if (!patientName) {
          patientName = `Patient (ID: ${appointment.patientId.substring(0, 8)}...)`;
        }
        
        setSelectedPatient({
          id: appointment.patientId,
          name: patientName
        });
      }
    }
  }, [appointment, form]);

  const onSubmit = (data: AppointmentFormValues) => {
    updateAppointmentMutation.mutate({
      id: appointmentId,
      data: {
        id: appointmentId,
        ...data,
        appointmentDate: new Date(data.appointmentDate).toISOString(), // Convert back to ISO string
      }
    })
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

  const handlePatientInfoClick = () => {
    setIsPatientInfoOpen(true)
  }

//   if (isLoading) {
//     return null
//   }

const [audioModalOpen, setAudioModalOpen] = useState<null | "reason" | "notes">(null);
  const reasonTranscriber = useTranscriber();
  const notesTranscriber = useTranscriber();

  // Audio transcription effect for reason
  useEffect(() => {
    const output = reasonTranscriber.output;
    if (output && !output.isBusy && output.text) {
      form.setValue(
        "reason",
        (form.getValues("reason") ? form.getValues("reason") + "\n" : "") + output.text
      );
      setAudioModalOpen(null);
    }
    // eslint-disable-next-line
  }, [reasonTranscriber.output?.isBusy]);

  // Audio transcription effect for notes
  useEffect(() => {
    const output = notesTranscriber.output;
    if (output && !output.isBusy && output.text) {
      form.setValue(
        "notes",
        (form.getValues("notes") ? form.getValues("notes") + "\n" : "") + output.text
      );
      setAudioModalOpen(null);
    }
    // eslint-disable-next-line
  }, [notesTranscriber.output?.isBusy]);


  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>Appointment Details</SheetTitle>
            {/* <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button> */}
          </SheetHeader>

          {!isEditing ? (
            // View Mode
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clinic</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment?.clinic?.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment?.patient ? (
                      appointment.patient.name || 
                      (appointment.patient.patientId ? 
                        `${appointment.patient.patientId}${appointment.patient.species ? ` (${appointment.patient.species})` : ''}` : 
                        (appointment.patient.firstName || appointment.patient.lastName ? 
                          `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim() : 
                          `Patient (ID: ${appointment.patient.id.substring(0, 8)}...)`)
                      )
                    ) : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment?.client?.firstName} {appointment?.client?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Veterinarian</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment?.veterinarian?.firstName}{appointment?.veterinarian?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Room</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment?.room?.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Appointment Type</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {appointment?.appointmentType.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : ''}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {appointment?.roomSlot ? 
                   `${formatTime(appointment.roomSlot.startTime)} - ${formatTime(appointment.roomSlot.endTime)}` : 
                   appointment?.startTime && appointment?.endTime ? 
                     `${formatTime(appointment.startTime)} - ${formatTime(appointment.endTime)}` : 
                     'Not set'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 ">Status</h3>
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
                {(appointment?.status === "in_progress" || appointment?.status === "completed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 theme-button-outline"
                      onClick={handlePatientInfoClick}
                    >
                      <ClipboardList className=" h-4 w-4 mr-1" />
                      Visit Details
                    </Button>
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

                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient</FormLabel>
                        <FormControl>
                          <div className="relative flex-grow" ref={searchDropdownRef}>
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
                                    ) : typedSearchResults.length === 0 ? (
                                      <div className="p-2 text-center text-gray-500">No patients found</div>
                                    ) : (
                                      <ul>
                                        {typedSearchResults.map((patient) => {
                                          // Determine the display name
                                          let displayName = '';
                                          
                                          if (patient.name) {
                                            displayName = patient.name;
                                          } 
                                          else if (patient.patientId) {
                                            displayName = patient.patientId;
                                            if (patient.species) {
                                              displayName += ` (${patient.species})`;
                                            }
                                          }
                                          else if (patient.firstName || patient.lastName) {
                                            displayName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                                          }
                                          
                                          if (!displayName) {
                                            displayName = `Patient (ID: ${patient.id.substring(0, 8)}...)`;
                                          }
                                          
                                          return (
                                            <li
                                              key={patient.id}
                                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                              onClick={() => handlePatientSelect(patient)}
                                            >
                                              <div className="font-medium">{displayName}</div>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                            <input type="hidden" {...field} />
                          </div>
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
                            options={appointmentTypeOptions}
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
                    name="roomSlotId"
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
                                      selectedSlot === slot.id || field.value === slot.id
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
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Reason</FormLabel>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setAudioModalOpen("reason")}
                            title="Record voice note"
                            disabled={reasonTranscriber.output?.isBusy}
                          >
                            {reasonTranscriber.output?.isBusy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        <AudioManager
                          open={audioModalOpen === "reason"}
                          onClose={() => setAudioModalOpen(null)}
                          transcriber={reasonTranscriber}
                          onTranscriptionComplete={() => setAudioModalOpen(null)}
                        />
                      </FormItem>
                    )}
                  />

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
                            onClick={() => setAudioModalOpen("notes")}
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        <AudioManager
                          open={audioModalOpen === "notes"}
                          onClose={() => setAudioModalOpen(null)}
                          transcriber={notesTranscriber}
                          onTranscriptionComplete={() => setAudioModalOpen(null)}
                        />
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

      {isPatientInfoOpen && (
        <PatientInformation 
          patientId={appointment?.patientId || ''}
          appointmentId={appointmentId}
          onClose={() => setIsPatientInfoOpen(false)}
        />
      )}
    </>
  )
}