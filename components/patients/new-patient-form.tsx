"use client"

import { useState } from "react"
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
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreatePatient } from "@/queries/patients/create-patients"
import { ClientSelect } from "@/components/clients/client-select"
import { ClientForm } from "@/components/clients/client-form"
import { Separator } from "@/components/ui/separator"
import { Client } from "@/queries/clients/get-client"
import { ClinicSelect } from "@/components/clinics/clinic-select"

const patientFormSchema = z.object({
  clientId: z.string().min(1, "Owner is required"),
  clinicId: z.string().min(1, "Clinic is required"),
  name: z.string().min(1, "Name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  color: z.string().min(1, "Color is required"),
  gender: z.string().min(1, "Gender is required"),
  isNeutered: z.boolean().default(false),
  dateOfBirth: z.date(),
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
  isNeutered: false,
  isActive: true,
  weightKg: 0,
}

interface NewPatientFormProps {
  onSuccess: () => void
}

export function NewPatientForm({ onSuccess }: NewPatientFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const createPatientMutation = useCreatePatient()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  })

  async function onSubmit(data: PatientFormValues) {
    setIsPending(true)
    try {
      // Get the selected client to access its clinicId
      const selectedClientId = data.clientId;
      
      // Use the selected client ID from the form
      const patientData = {
        ...data,
        clinicId: data.clinicId, // Use the selected clinic ID
        dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      }

      await createPatientMutation.mutateAsync(patientData)
      
      toast({
        title: "Patient created",
        description: "The patient has been successfully created.",
      })
      
      onSuccess()
      form.reset(defaultValues)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  const handleClientCreated = (client: Client) => {
    // Set the client ID in the form
    form.setValue("clientId", client.id);
    setShowClientForm(false);
    toast({
      title: "Owner added",
      description: `${client.firstName} ${client.lastName} has been added as an owner.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Owner information */}
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-medium">Owner Information</h3>
            {!showClientForm ? (
              <div className="space-y-2">
                <ClientSelect 
                  control={form.control} 
                  name="clientId" 
                  label="Select Owner" 
                  onAddNewClick={() => setShowClientForm(true)}
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

          {/* Vertical separator */}
          <div className="hidden lg:block">
            <Separator orientation="vertical" className="h-full" />
          </div>
          
          {/* Horizontal separator for mobile */}
          <div className="block lg:hidden">
            <Separator className="w-full" />
          </div>

          {/* Right side - Patient information */}
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-medium">Patient Information</h3>
            <div className="space-y-4">
              {/* Add Clinic selection field */}
              <ClinicSelect
                control={form.control}
                name="clinicId"
                label="Clinic"
                description="Select the clinic for this patient"
              />
              
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
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any allergies (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any medical conditions (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="behavioralNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Behavioral Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any behavioral notes (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        This indicates whether the patient is currently active.
                      </FormDescription>
                    </div>
                    <FormMessage />
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
            disabled={isPending || showClientForm}
            className="theme-button text-white"
          >
            {isPending ? "Creating..." : "Create Patient"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 