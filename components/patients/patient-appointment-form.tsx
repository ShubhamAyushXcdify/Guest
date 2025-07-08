"use client"

import React, { useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/datePicker"
import { useCreateAppointment } from "@/queries/appointment"
import { useToast } from "@/components/ui/use-toast"
import { useGetClinic } from "@/queries/clinic/get-clinic"

// Define the form schema
const appointmentSchema = z.object({
  clinicId: z.string().uuid("Please select a clinic"),
  patientId: z.string().uuid("Please select a patient"),
  appointmentDate: z.date()
    .refine(date => !!date, "Please select an appointment date")
    .refine(date => {
      const today = new Date();
      today.setHours(0,0,0,0);
      return date >= today;
    }, "Appointment date cannot be in the past"),
  reason: z.string().min(1, "Please provide a reason for the appointment"),
  notes: z.string().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface PatientAppointmentFormProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  patients: any[]
}

export default function PatientAppointmentForm({ isOpen, onClose, clientId, patients }: PatientAppointmentFormProps) {
  const { toast } = useToast()
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clinicId: "",
      patientId: "",
      appointmentDate: undefined,
      reason: "",
      notes: "",
    },
  })

  // Fetch clinics
  const { data: clinicsData } = useGetClinic(1, 100)
  const clinicOptions = (clinicsData?.items || []).map(clinic => ({
    value: clinic.id,
    label: clinic.name
  }))

  // Create patient options from provided patients
  const patientOptions = patients.map(patient => ({
    value: patient.id,
    label: patient.name
  }))

  const { mutate: createAppointment, isPending } = useCreateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment request submitted successfully",
      })
      form.reset()
      onClose()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit appointment request",
        variant: "destructive",
      })
    }
  })

  const onSubmit = (data: AppointmentFormValues) => {
    try {
      if (!data.appointmentDate) {
        throw new Error("Appointment date is required")
      }
      
      const formattedAppointmentDate = data.appointmentDate.toISOString().split('T')[0] // YYYY-MM-DD

      const formattedData = {
        ...data,
        clientId,
        appointmentDate: formattedAppointmentDate,
        status: "requested", // Set status to requested for client-submitted appointments
        isRegistered: true, // Set isRegistered to true as requested
        isActive: true
      }
      
      createAppointment(formattedData)
    } catch (error) {
      console.error("Error submitting form:", error)
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  // Set default appointment date to today when component mounts
  useEffect(() => {
    form.setValue("appointmentDate", new Date())
  }, [form])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Request New Appointment</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                    <Combobox
                      options={patientOptions}
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
              name="appointmentDate"
              render={({ field }) => {
                // Set minDate to start of today (midnight)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                return (
                  <FormItem>
                    <FormLabel>Preferred Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        minDate={today}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Visit</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Please describe the reason for your appointment request"
                      className="min-h-[100px]"
                    />
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
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional information you'd like to provide"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="theme-button text-white" 
                disabled={isPending}
              >
                {isPending ? "Submitting..." : "Request Appointment"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
} 