"use client"

import React, { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { CalendarIcon, Plus, Mic, Loader2, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreatePatient } from "@/queries/patients/create-patients"
import { ClientForm } from "@/components/clients/client-form"
import { Separator } from "@/components/ui/separator"
import { Client } from "@/queries/clients/get-client"
import { useRootContext } from '@/context/RootContext'
import { useGetClients } from "@/queries/clients/get-client"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { useDebounce } from "@/hooks/use-debounce"

const patientFormSchema = z.object({
  clientId: z.string().nonempty("Owner is required"),
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  color: z.string().min(1, "Color is required"),
  gender: z.string().min(1, "Gender is required"),
  isNeutered: z.boolean().default(false),
  dateOfBirth: z.coerce.date().max(new Date(), "Date of birth cannot be in the future"),
  weightKg: z.coerce.number().min(0, "Weight must be a positive number"),
  microchipNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  behavioralNotes: z.string().optional(),
  isActive: z.boolean().default(true),
})

type PatientFormValues = z.infer<typeof patientFormSchema>

const defaultValues: Partial<PatientFormValues> = {
  clientId: "",
  name: "",
  species: "",
  breed: "",
  color: "",
  gender: "",
  isNeutered: false,
  isActive: true,
  weightKg: 0,
}

interface NewPatientFormProps {
  onSuccess: () => void;
  defaultClientId?: string;
  hideOwnerSection?: boolean;
}

export function NewPatientForm({ onSuccess, defaultClientId, hideOwnerSection = false }: NewPatientFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const { user, userType, clinic } = useRootContext()
  const createPatientMutation = useCreatePatient()
  const { toast } = useToast()
  
  // New states for client search
  const [clientSearchQuery, setClientSearchQuery] = useState("")
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const debouncedClientQuery = useDebounce(handleClientSearch, 300)  // Debounce the client search query
  const [selectedClient, setSelectedClient] = useState<{ id: string, name: string } | null>(null)
  
  const { data: clientsData, isLoading: isLoadingClients } = useGetClients(
    1, 100, clientSearchQuery, 'firstName', !!clientSearchQuery
  )
  const clients = clientsData?.items || []

  // Set default values with provided clientId
  const initialValues = {
    ...defaultValues,
    clientId: defaultClientId || "",
  }

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialValues
  })

  // Set clientId when defaultClientId is provided
  useEffect(() => {
    if (defaultClientId) {
      form.setValue("clientId", defaultClientId);
    }
  }, [defaultClientId, form]);

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient({
      id: client.id,
      name: `${client.firstName} ${client.lastName}`
    });
    
    form.setValue("clientId", client.id);
    
    setClientSearchQuery(""); // Clear the search input
    setIsSearchDropdownOpen(false); // Close the dropdown
  };
  
  // Clear the selected client
  const clearSelectedClient = () => {
    setSelectedClient(null);
    form.setValue("clientId", "");
  };

  async function onSubmit(data: PatientFormValues) {
    setIsPending(true)
    try {
      // Use the selected client ID from the form
      const patientData = {
        ...data,
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      }

      await createPatientMutation.mutateAsync(patientData)
      
      toast({
        title: "Pet registered",
        description: "Your pet has been successfully registered.",
        variant: "success", 
      })
      
      onSuccess()
      form.reset(initialValues)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while registering the pet.",
        variant: "error",
      })
    } finally {
      setIsPending(false)
    }
  }

  function handleClientSearch(searchTerm: string) {
    setClientSearchQuery(searchTerm);
  }

  const handleClientCreated = (client: Client) => {
    // Set the client ID in the form
    form.setValue("clientId", client.id);
    toast({
      title: "Owner added",
      description: `${client.firstName} ${client.lastName} has been added as an owner.`,
      variant: "success",
    });
    // Delay closing the form to allow the toast to be seen
    setTimeout(() => {
      setShowClientForm(false);
    }, 500); // Adjust delay as needed, 500ms (0.5 seconds) is usually enough
  };

  const [audioModalOpen, setAudioModalOpen] = useState<null | "allergies" | "medicalConditions" | "behavioralNotes">(null);
  const allergiesTranscriber = useTranscriber();
  const medicalConditionsTranscriber = useTranscriber();
  const behavioralNotesTranscriber = useTranscriber();

  // Audio transcription effects remain the same...

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Owner information */}
          {!hideOwnerSection && (
            <div className="flex-1 space-y-6">
              <h3 className="text-lg font-medium">Owner Information</h3>
              {!showClientForm ? (
                <div className="space-y-4">
                  {/* Owner search */}
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <div className="relative flex-grow">
                              {selectedClient ? (
                                <div className="flex items-center justify-between p-2 border rounded-md">
                                  <span>{selectedClient.name}</span>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="p-1 h-auto"
                                    onClick={clearSelectedClient}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                      placeholder="Search owners by name"
                                      className="pl-10"
                                      value={clientSearchQuery}
                                      onChange={(e) => {
                                        debouncedClientQuery(e.target.value);
                                      
                                        setIsSearchDropdownOpen(true);
                                      }}
                                      onFocus={() => setIsSearchDropdownOpen(true)}
                                    />
                                  </div>
                                  
                                  {/* Search results dropdown */}
                                  {isSearchDropdownOpen && clientSearchQuery && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                      {isLoadingClients ? (
                                        <div className="p-2 text-center text-gray-500">Searching...</div>
                                      ) : clients.length === 0 ? (
                                        <div className="p-2 text-center text-gray-500">No owners found</div>
                                      ) : (
                                        <ul>
                                          {clients.map((client) => (
                                            <li
                                              key={client.id}
                                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                              onClick={() => handleClientSelect(client)}
                                            >
                                              <div className="font-medium">{client.firstName} {client.lastName}</div>
                                              <div className="text-sm text-gray-500">
                                                {client.email}
                                              </div>
                                            </li>
                                          ))}
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
                              onClick={() => setShowClientForm(!showClientForm)}
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
                  
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-primary flex items-center"
                    onClick={() => setShowClientForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add a new owner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="mb-2"
                    onClick={() => setShowClientForm(false)}
                  >
                    Back to Owner Selection
                  </Button>
                  <ClientForm 
                    onSuccess={handleClientCreated}
                    nestedForm={true}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Hidden input for clientId when owner section is hidden */}
          {hideOwnerSection && (
            <input type="hidden" {...form.register("clientId")} />
          )}

          {/* Vertical separator */}
          {!hideOwnerSection && (
            <>
              <div className="hidden lg:block">
                <Separator orientation="vertical" className="h-full" />
              </div>
              
              {/* Horizontal separator for mobile */}
              <div className="block lg:hidden">
                <Separator className="w-full" />
              </div>
            </>
          )}

          {/* Right side - Patient information */}
          <div className={`flex-1 space-y-6 ${hideOwnerSection ? 'w-full' : ''}`}>
            <h3 className="text-lg font-medium">Pet Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Pet name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dog">Dog</SelectItem>
                          <SelectItem value="Cat">Cat</SelectItem>
                          <SelectItem value="Bird">Bird</SelectItem>
                          <SelectItem value="Rabbit">Rabbit</SelectItem>
                          <SelectItem value="Reptile">Reptile</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="Breed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">male</SelectItem>
                          <SelectItem value="female">female</SelectItem>
                          <SelectItem value="unknown">unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isNeutered"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 space-y-0 mt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Neutered/Spayed</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="microchipNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Microchip Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Microchip number (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Registration number (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Insurance provider (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="insurancePolicyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Policy number (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                    <FormLabel>Allergies</FormLabel>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setAudioModalOpen("allergies")}
                      title="Record voice note"
                      disabled={allergiesTranscriber.output?.isBusy}
                    >
                      {allergiesTranscriber.output?.isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                    <FormControl>
                      <textarea
                        id="allergies"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-full h-20 p-2 border rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                    <AudioManager
                      open={audioModalOpen === "allergies"}
                      onClose={() => setAudioModalOpen(null)}
                      transcriber={allergiesTranscriber}
                      onTranscriptionComplete={() => setAudioModalOpen(null)}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Medical Conditions</FormLabel>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setAudioModalOpen("medicalConditions")}
                        title="Record voice note"
                        disabled={medicalConditionsTranscriber.output?.isBusy}
                      >
                        {medicalConditionsTranscriber.output?.isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <textarea
                        id="medicalConditions"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-full h-20 p-2 border rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                    <AudioManager
                      open={audioModalOpen === "medicalConditions"}
                      onClose={() => setAudioModalOpen(null)}
                      transcriber={medicalConditionsTranscriber}
                      onTranscriptionComplete={() => setAudioModalOpen(null)}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="behavioralNotes"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Behavioral Notes</FormLabel>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setAudioModalOpen("behavioralNotes")}
                        title="Record voice note"
                        disabled={behavioralNotesTranscriber.output?.isBusy}
                      >
                        {behavioralNotesTranscriber.output?.isBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <textarea
                        id="behavioralNotes"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-full h-20 p-2 border rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                    <AudioManager
                      open={audioModalOpen === "behavioralNotes"}
                      onClose={() => setAudioModalOpen(null)}
                      transcriber={behavioralNotesTranscriber}
                      onTranscriptionComplete={() => setAudioModalOpen(null)}
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || (!hideOwnerSection && showClientForm)}
            className="theme-button text-white"
          >
            {isPending ? "Registering..." : "Register Pet"}
          </Button>
        </div>
      </form>
    </Form>
  )
}