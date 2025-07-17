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
import { Plus, Search, X, Loader2, Mic, Sparkles } from "lucide-react"
import { useRootContext } from '@/context/RootContext'
import { useGetRoomsByClinicId } from "@/queries/rooms/get-room-by-clinic-id"
import { useSearchPatients } from "@/queries/patients/get-patients-by-search"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetAvailableSlotsByUserId, AvailableSlot } from "@/queries/users/get-availabelSlots-by-userId"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { useGetAppointmentType } from "@/queries/appointmentType/get-appointmentType"
import { useGetPatientById } from "@/queries/patients/get-patient-by-id"
import { useUpdateAppointment } from "@/queries/appointment/update-appointment"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useGetUserById } from "@/queries/users/get-user-by-id"
import { reasonFormatting, notesFormatting } from "@/app/actions/reasonformatting";

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
  appointmentDate: z.date()
    .refine(date => !!date, "Please select an appointment date")
    .refine(date => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return date >= today;
    }, "Appointment date cannot be in the past"),
  slotId: z.string().min(1, "Please select a slot"),
  appointmentTypeId: z.string().min(1, "Please select an appointment type"),
  reason: z.string().min(1, "Please provide a reason for the appointment"),
  status: z.string(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
  isRegistered: z.boolean().optional(),
  sendEmail: z.boolean().optional(),
})

type NewAppointmentFormValues = z.infer<typeof newAppointmentSchema>

interface NewAppointmentProps {
  isOpen: boolean
  onClose: () => void
  patientId?: string
  preSelectedClinic?: string
  preSelectedRoom?: string | null
  appointmentId?: string | null
  sendEmail?: boolean
}

// Define the SlotResponse interface to match your API
interface SlotResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: AvailableSlot[];
}

function NewAppointment({ isOpen, onClose, patientId, preSelectedClinic, preSelectedRoom, appointmentId, sendEmail = false }: NewAppointmentProps) {
  const { toast } = useToast()
  const { user, userType, clinic } = useRootContext()
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  // Patient search state
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  
  const [selectedPatient, setSelectedPatient] = useState<{ id: string, name: string, clientId?: string } | null>(null)
  
  const { data: searchResults = [], isLoading: isSearching } = useSearchPatients(
    patientSearchQuery,
    "name" // Always search by name as specified
  )
  
  // Fetch specific patient by ID when patientId is provided
  const { data: specificPatient } = useGetPatientById(patientId || "");
  
  // Fetch appointment by ID when editing
  const { data: appointmentData, isLoading: isLoadingAppointment } = useGetAppointmentById(appointmentId || "");

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
      appointmentTypeId: "",
      reason: "",
      status: "scheduled",
      notes: "",
      isActive: true,
      isRegistered: false,
        },
  })

  // Get selected veterinarian ID and date for slots
  const selectedVeterinarianId = form.watch("veterinarianId");
  const selectedDate = form.watch("appointmentDate");

  // Format selected date to YYYY-MM-DD for API filtering
  // Use local date methods to ensure the date stays in the user's timezone
  const formattedDate = selectedDate ? 
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 
    '';
    
  // Fetch available slots for the selected veterinarian using the new hook
  const { 
    data: availableSlots = [], 
    isLoading: isLoadingSlots 
  } = useGetAvailableSlotsByUserId(
    selectedVeterinarianId, 
    formattedDate, 
    !!selectedVeterinarianId && !!formattedDate
  );

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
  const { data: clinics } = useGetClinic(1, 100, '', null, null, true)
  const selectedClinicId = form.watch("clinicId") || clinic?.id || "";

  const { data: usersResponse = { items: [] } } = useGetUsers(1, 100, '', selectedClinicId, true);
  const veterinarianOptions = (usersResponse.items || [])
  .filter(user => user.roleName === "Veterinarian" && (user as any).clinicId === selectedClinicId)
  .map(vet => ({
    value: vet.id,
    label: `Dr. ${vet.firstName} ${vet.lastName}`
  }));
  
  // Transform API data into Combobox format
  const clinicOptions = (clinics?.items || []).map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }))
  
  const { data: patientsResponse, refetch: refetchPatients } = useGetPatients(
    1, // page
    100, // pageSize
    '', // search
    '' // clientId
  );
  
  const { data: rooms, isLoading: isLoadingRooms } = useGetRoomsByClinicId(selectedClinicId);
  const { data: appointmentTypes = [], isLoading: isLoadingAppointmentTypes } = useGetAppointmentType(1, 100, '', true);
  
  const roomOptions = isLoadingRooms 
  ? [] 
  : (rooms || []).filter((room: any) => room.isActive).map((room: any) => ({
    value: room.id,
    label: `${room.name} (${room.roomType})`
  }));
  
  const appointmentTypeOptions = isLoadingAppointmentTypes
  ? []
  : (appointmentTypes || []).filter((type) => type.isActive).map((type) => ({
    value: type.appointmentTypeId,
    label: type.name
  }));

  const { mutate: createAppointment, isPending } = useCreateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment created successfully",
      })
      form.reset() // Clear the form after successful creation
      setSelectedPatient(null) // Clear selected patient after creation
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
  
  // Update appointment mutation
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      })
      form.reset() // Clear the form after successful update
      setSelectedPatient(null) // Clear selected patient after update
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
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
      // Format date using local date methods to maintain consistency
      const formattedAppointmentDate = `${data.appointmentDate.getFullYear()}-${String(data.appointmentDate.getMonth() + 1).padStart(2, '0')}-${String(data.appointmentDate.getDate()).padStart(2, '0')}`;

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
        const fullPatientData = patientsResponse.items?.find((p: any) => p.id === patientId);
        
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

      // Find selected slot details from the availableSlots array
      const selectedSlotDetails = availableSlots.find(slot => slot.id === data.slotId);
      
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
        appointmentTimeFrom: selectedSlotDetails.startTime,
        appointmentTimeTo: selectedSlotDetails.endTime,
        roomSlotId: data.slotId, // Keep for backward compatibility
        createdBy: user?.id,
      } as any; // Use type assertion to allow adding id property
      
      // Add isRegistered and sendEmail for appointment approvals
      if (appointmentId) {
        formattedData.isRegistered = false; // Mark as not registered (approved)
        formattedData.id = appointmentId; // Include the ID in the payload data
        formattedData.status = "scheduled"; // Ensure status is set to scheduled when updating
        
        if (sendEmail) {
          formattedData.sendEmail = true; // Send confirmation email
        }
        
        // Update existing appointment
        updateAppointmentMutation.mutate({
          id: appointmentId,
          data: formattedData
        });
      } else {
        // Create new appointment
        createAppointment(formattedData);
      }
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
    const latestPatient = patientsResponse?.items?.[patientsResponse.items?.length - 1]
    if (latestPatient) {
      form.setValue("patientId", latestPatient.id)
      
      // Update the selected patient state
      setSelectedPatient({
        id: latestPatient.id,
        name: latestPatient.name,
        clientId: latestPatient.clientId
      });
      
      toast({
        title: "Patient added",
        description: `${latestPatient.name} has been added successfully.`,
      })
    } else {
      toast({
        title: "Patient added",
        description: "Patient has been added successfully, refreshing patient list.",
      })
    }
    
    // Always close the form regardless of patient data availability
    setShowNewPatientForm(false)
  }

  const handlePatientSearch = (searchTerm: string) => {
    setPatientSearchQuery(searchTerm)
    
    // Update URL with search parameter but don't expose specific fields
    const url = new URL(window.location.href);
    url.searchParams.set('search', encodeURIComponent(searchTerm));
    
    // Update the URL without page reload
    window.history.pushState({}, '', url.toString());
  }
  const debouncedPatientQuery = useDebounce(handlePatientSearch, 300)

  const handleCancel = () => {
    setShowNewPatientForm(false)
    form.reset() // Clear the form on close
    setSelectedPatient(null) // Clear selected patient on close
    onClose()
  }

  const handleClinicDefaultState = () => {
    // Don't overwrite preSelectedClinic if it's already set
    if (preSelectedClinic) {
      return;
    }
    
    // Only set default clinic if no preSelectedClinic was provided
    if (clinic?.id) {
      form.setValue("clinicId", clinic.id);
    } else if (clinicOptions.length === 1) {
      form.setValue("clinicId", clinicOptions[0].value);
    }
  }

  useEffect(() => {
    handleClinicDefaultState()
  }, [clinic])

  // Make sure this runs when component mounts and when preSelectedClinic/preSelectedRoom changes
  useEffect(() => {
    console.log("Init form with selections:", { preSelectedClinic, preSelectedRoom, isOpen });
    
    if (isOpen) {
      // Force a slight delay to ensure the form is ready
      setTimeout(() => {
        // Set clinic ID (from props or context)
        if (preSelectedClinic) {
          console.log("Setting clinic ID:", preSelectedClinic);
          form.setValue("clinicId", preSelectedClinic);
        } else if (clinic?.id) {
          console.log("Setting clinic ID from context:", clinic.id);
          form.setValue("clinicId", clinic.id);
        }
        
        // Set room ID if provided
        if (preSelectedRoom) {
          console.log("Setting room ID:", preSelectedRoom);
          form.setValue("roomId", preSelectedRoom);
        }
        
        // If patientId is provided, set it in the form
        if (patientId && specificPatient) {
          form.setValue("patientId", patientId);
          setSelectedPatient({
            id: specificPatient.id,
            name: specificPatient.name,
            clientId: specificPatient.clientId
          });
        }
      }, 100);
    }
  }, [isOpen, preSelectedClinic, preSelectedRoom, patientId, specificPatient, form, clinic]);
  
  // Set default appointment date to today when component mounts
  useEffect(() => {
    form.setValue("appointmentDate", new Date());
  }, []);

  // Auto-select the current user as veterinarian if they have the Veterinarian role
  useEffect(() => {
    if (isOpen && user && veterinarianOptions.length > 0) {
      // Check if the current user is in the veterinarian options list
      const currentVetOption = veterinarianOptions.find(vet => vet.value === user.id);
      if (currentVetOption) {
        form.setValue("veterinarianId", user.id);
      }
    }
  }, [isOpen, user, veterinarianOptions, form]);

  // Pre-fill form with appointment data when editing
  useEffect(() => {
    if (isOpen && appointmentId && appointmentData) {
      // Set form values from appointment data
      form.setValue("clinicId", appointmentData.clinicId);
      form.setValue("patientId", appointmentData.patientId);
      form.setValue("veterinarianId", appointmentData.veterinarianId);
      form.setValue("roomId", appointmentData.roomId);
      
      // Handle date
      if (appointmentData.appointmentDate) {
        const appointmentDate = new Date(appointmentData.appointmentDate);
        form.setValue("appointmentDate", appointmentDate);
      }
      
      // Set other fields
      form.setValue("slotId", appointmentData.roomSlotId || appointmentData.slotId);
      form.setValue("appointmentTypeId", appointmentData.appointmentTypeId);
      form.setValue("reason", appointmentData.reason || "");
      form.setValue("notes", appointmentData.notes || "");
      form.setValue("status", appointmentData.status || "scheduled");
      
      // Set selected slot
      if (appointmentData.roomSlotId || appointmentData.slotId) {
        setSelectedSlot(appointmentData.roomSlotId || appointmentData.slotId);
      }
      
      // Set selected patient
      if (appointmentData.patient) {
        setSelectedPatient({
          id: appointmentData.patientId,
          name: appointmentData.patient.name,
          clientId: appointmentData.clientId
        });
      }
    }
  }, [isOpen, appointmentId, appointmentData, form]);

  // Clear the selected patient
  const clearSelectedPatient = () => {
    setSelectedPatient(null);
    form.setValue("patientId", "");
  }

  const [audioModalOpen, setAudioModalOpen] = useState<null | "reason" | "notes">(null);
  const reasonTranscriber = useTranscriber();
  const notesTranscriber = useTranscriber();
  const [isReasonFormatting, setIsReasonFormatting] = useState(false);
  const [isNotesFormatting, setIsNotesFormatting] = useState(false);

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

  // Remove the room slot dependency - we'll only use veterinarian slots now
  useEffect(() => {
    if (selectedVeterinarianId) {
      // Clear the selected slot when veterinarian changes
      setSelectedSlot(null);
      form.setValue("slotId", "");
    }
  }, [selectedVeterinarianId]);

  // Handler for AI formatting of reason
  const handleAIFormatReason = async () => {
    const currentReason = form.getValues("reason");
    if (!currentReason) return;
    setIsReasonFormatting(true);
    try {
      const formatted = await reasonFormatting(currentReason);
      form.setValue("reason", formatted);
    } catch (e) {
      // Optionally show error toast
      toast({ title: "AI Formatting Error", description: "Failed to format reason.", variant: "destructive" });
    } finally {
      setIsReasonFormatting(false);
    }
  };

  // Handler for AI formatting of notes
  const handleAIFormatNotes = async () => {
    const currentNotes = form.getValues("notes");
    if (!currentNotes) return;
    setIsNotesFormatting(true);
    try {
      const formatted = await notesFormatting(currentNotes);
      form.setValue("notes", formatted);
    } catch (e) {
      toast({ title: "AI Formatting Error", description: "Failed to format notes.", variant: "destructive" });
    } finally {
      setIsNotesFormatting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent className={`w-[95%] sm:!max-w-full md:!max-w-[${showNewPatientForm ? '95%' : '50%'}] lg:!max-w-[${showNewPatientForm ? '95%' : '50%'}] overflow-x-hidden overflow-y-auto transition-all duration-300`}>
        <SheetHeader>
          <SheetTitle>{appointmentId ? 'Update Appointment' : 'New Appointment'}</SheetTitle>
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
                                          handlePatientSearch(e.target.value);
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
                            onValueChange={field.onChange}
                            placeholder={isLoadingRooms ? "Loading rooms..." : "Select room"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <FormControl>
                          <Combobox
                            options={appointmentTypeOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={isLoadingAppointmentTypes ? "Loading appointment types..." : "Select appointment type"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => {
                      // Set minDate to start of today (midnight)
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      return (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              minDate={today}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Available Slots section - only show when veterinarian and date are selected */}
                {selectedVeterinarianId && selectedDate && (
                  <FormField
                    control={form.control}
                    name="slotId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Available Slots
                        </FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            {isLoadingSlots ? (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading available slots...
                              </div>
                            ) : availableSlots.length === 0 ? (
                              <div className="text-sm text-gray-500">
                                No available slots for this veterinarian on the selected date
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {availableSlots.map((slot) => (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => handleSlotClick(slot.id)}
                                    className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                                      selectedSlot === slot.id
                                        ? 'bg-green-100 border-green-300 text-green-800'
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    title={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                                  >
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
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
                        <div className="flex items-center gap-2">
                          <FormLabel className="mb-0">Reason</FormLabel>
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAIFormatReason}
                            disabled={isReasonFormatting}
                            className="ml-2 flex items-center gap-1 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-purple-500 hover:to-blue-500 hover:scale-105 transition-transform duration-150 border-0 px-2 py-0.5 rounded-full text-sm"
                          >
                            <Sparkles className="w-3 h-3" />
                            {isReasonFormatting ? <Loader2 className="w-3 h-3 animate-spin" /> : "AI Format"}
                          </Button>
                        </div>
                        <FormControl>
                          <textarea
                            id="reason"
                            value={field.value}
                            onChange={e => field.onChange(e.target.value)}
                            className="w-full h-20 p-2 border rounded-md"
                          />
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
                          <FormLabel className="mb-0">Notes</FormLabel>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setAudioModalOpen("notes")}
                            title="Record voice note"
                            disabled={reasonTranscriber.output?.isBusy}
                          >
                            {reasonTranscriber.output?.isBusy ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mic className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAIFormatNotes}
                            disabled={isNotesFormatting}
                            className="ml-2 flex items-center gap-1 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-purple-500 hover:to-blue-500 hover:scale-105 transition-transform duration-150 border-0 px-2 py-0.5 rounded-full text-sm"
                          >
                            <Sparkles className="w-3 h-3" />
                            {isNotesFormatting ? <Loader2 className="w-3 h-3 animate-spin" /> : "AI Format"}
                          </Button>
                        </div>
                        <FormControl>
                          <textarea
                            id="notes"
                            value={field.value}
                            onChange={e => field.onChange(e.target.value)}
                            className="w-full h-20 p-2 border rounded-md"
                          />
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
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" className="theme-button text-white" disabled={isPending || showNewPatientForm}>
                    {isPending ? (appointmentId ? "Updating..." : "Creating...") : (appointmentId ? "Update Appointment" : "Create Appointment")}
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
