"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
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
import { CalendarIcon, Mic, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUpdatePatient } from "@/queries/patients/update-patient"
import { Patient } from "@/queries/patients/get-patients"
import { useGetPatientById } from "@/queries/patients/get-patient-by-id"
import { AudioManager } from "@/components/audioTranscriber/AudioManager"
import { useTranscriber } from "@/components/audioTranscriber/hooks/useTranscriber"
import { Switch } from "@/components/ui/switch"

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

interface PatientEditDetailsProps {
  patientId: string;
  onSuccess: () => void;
}
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Unknown" }
];
const SPECIES_OPTIONS = [
  { value: "Dog", label: "Dog" },
  { value: "Cat", label: "Cat" },
  { value: "Bird", label: "Bird" },
  { value: "Rabbit", label: "Rabbit" },
  { value: "Reptile", label: "Reptile" },
  { value: "Other", label: "Other" }
];

export function PatientEditDetails({ patientId, onSuccess }: PatientEditDetailsProps) {
  const [isPending, setIsPending] = useState(false)
  const [isFormReady, setIsFormReady] = useState(false)
  const [audioModalOpen, setAudioModalOpen] = useState<null | "allergies" | "medicalConditions" | "behavioralNotes">(null)
  const { toast } = useToast()
  
  const updatePatientMutation = useUpdatePatient()
  const { data: patient, isLoading } = useGetPatientById(patientId)
  
  const allergiesTranscriber = useTranscriber()
  const medicalConditionsTranscriber = useTranscriber()
  const behavioralNotesTranscriber = useTranscriber()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      clientId: "",
      name: "",
      species: "",
      breed: "",
      color: "",
      gender: "",
      isNeutered: false,
      weightKg: 0,
      isActive: true,
    }
  })

  // Update form when patient data is loaded
  useEffect(() => {
    if (patient && !isFormReady) {
      const formData = {
        ...patient,
        dateOfBirth: new Date(patient.dateOfBirth),
        species: patient.species || '',
        gender: patient.gender || '',
        breed: patient.breed || '',
        color: patient.color || '',
        weightKg: patient.weightKg ?? 0,
        isNeutered: patient.isNeutered ?? false,
        isActive: patient.isActive ?? true,
        microchipNumber: patient.microchipNumber || '',
        registrationNumber: patient.registrationNumber || '',
        insuranceProvider: patient.insuranceProvider || '',
        insurancePolicyNumber: patient.insurancePolicyNumber || '',
        allergies: patient.allergies || '',
        medicalConditions: patient.medicalConditions || '',
        behavioralNotes: patient.behavioralNotes || '',
      }
      
      form.reset(formData)
      setIsFormReady(true)
    }
  }, [patient, form, isFormReady])

  // Audio transcription effects
  useEffect(() => {
    const handleTranscription = (field: "allergies" | "medicalConditions" | "behavioralNotes") => {
      const transcriber = {
        allergies: allergiesTranscriber,
        medicalConditions: medicalConditionsTranscriber,
        behavioralNotes: behavioralNotesTranscriber
      }[field]

      const output = transcriber.output
      if (output && !output.isBusy && output.text) {
        form.setValue(
          field,
          (form.getValues(field) ? form.getValues(field) + "\n" : "") + output.text
        )
        setAudioModalOpen(null)
      }
    }

    handleTranscription("allergies")
    handleTranscription("medicalConditions")
    handleTranscription("behavioralNotes")
  }, [
    allergiesTranscriber.output?.isBusy,
    medicalConditionsTranscriber.output?.isBusy,
    behavioralNotesTranscriber.output?.isBusy,
    form
  ])

  async function onSubmit(data: PatientFormValues) {
    setIsPending(true)
    try {
      const patientData = {
        ...data,
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      }

      await updatePatientMutation.mutateAsync({
        id: patientId,
        ...patientData
      })
      
      toast({
        title: "Patient Updated",
        description: "Patient information has been updated successfully",
        variant: "success",
      })
      
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update patient. Please try again.",
        variant: "error",
      })
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading patient details...</div>
  }

  if (!patient) {
    return <div className="p-4">Patient not found</div>
  }

  // Don't render the form until it's ready with data
  if (!isFormReady) {
    return <div className="p-4">Preparing form...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPECIES_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    defaultValue={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                    <Input placeholder="Microchip number (optional)" {...field} value={field.value || ""} />
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
                    <Input placeholder="Registration number (optional)" {...field} value={field.value || ""} />
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
                    <Input placeholder="Insurance provider (optional)" {...field} value={field.value || ""} />
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
                    <Input placeholder="Policy number (optional)" {...field} value={field.value || ""} />
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
                  <Textarea
                    placeholder="Any allergies"
                    className="resize-none h-20"
                    {...field}
                    value={field.value || ""}
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
                  <Textarea
                    placeholder="Any medical conditions"
                    className="resize-none h-20"
                    {...field}
                    value={field.value || ""}
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
                  <Textarea
                    placeholder="Any behavioral notes"
                    className="resize-none h-20"
                    {...field}
                    value={field.value || ""}
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

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-48">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="theme-button text-white"
          >
            {isPending ? "Updating..." : "Update Pet"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 