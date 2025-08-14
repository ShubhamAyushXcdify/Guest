"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Mic } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/datePicker"
import { DatePickerWithRangeV2 } from "@/components/ui/custom/date/date-picker-with-range"
import type { DateRange } from "react-day-picker"
import { useToast } from "@/hooks/use-toast"

import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useUpdateAppointment } from "@/queries/appointment/update-appointment"
import { useGetClinic } from "@/queries/clinic/get-clinic"
import { useGetPatients } from "@/queries/patients/get-patients"
import { useGetClients, Client } from "@/queries/clients/get-client"
import { getCompanyId } from "@/utils/clientCookie"
import { useRootContext } from "@/context/RootContext"
import { useGetUsers } from "@/queries/users/get-users"
import { useGetRoom } from "@/queries/rooms/get-room"
import { useGetAppointmentType } from "@/queries/appointmentType/get-appointmentType"
import { useGetAvailableSlotsByUserId } from "@/queries/users/get-availabelSlots-by-userId"

// Schema mirrors appointment-details edit form
const appointmentSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  clientId: z.string().uuid(),
  veterinarianId: z.string().uuid(),
  roomId: z.string().uuid(),
  appointmentDate: z.string(),
  SlotId: z.string().optional(),
  appointmentTypeId: z.string(),
  reason: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  createdBy: z.string().uuid().optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface ApproveAppointmentProps {
  appointmentId: string
  onClose: () => void
}

export default function ApproveAppointment({ appointmentId, onClose }: ApproveAppointmentProps) {
  const { toast } = useToast()
  const { data: appointment, isLoading } = useGetAppointmentById(appointmentId)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clinicId: "",
      patientId: "",
      clientId: "",
      veterinarianId: "",
      roomId: "",
      appointmentDate: "",
      SlotId: "",
      appointmentTypeId: "",
      reason: "",
      status: "scheduled",
      notes: "",
      createdBy: ""
    }
  })

  // Watch values used for dependent queries
  const selectedClinicId = form.watch("clinicId")
  const selectedVeterinarianId = form.watch("veterinarianId")
  const selectedDate = form.watch("appointmentDate")

  // Options data
  const { data: clinicsResponse } = useGetClinic(1, 100, '', true)
  const { data: patientsResponse } = useGetPatients(1, 100)
  const { user } = useRootContext()
  const companyId = (typeof window !== 'undefined' && getCompanyId()) || user?.companyId || ''
  const { data: clientsResponse } = useGetClients(1, 100, '', 'first_name', companyId)
  const { data: usersResponse } = useGetUsers(1, 100)
  const { data: roomsResponse } = useGetRoom(1, 100, '', selectedClinicId)
  const { data: appointmentTypes = [] } = useGetAppointmentType(1, 100, '', true)

  // Slots for the chosen veterinarian/date
  const { data: availableSlots = [], isLoading: isLoadingSlots } = useGetAvailableSlotsByUserId(
    selectedVeterinarianId,
    selectedDate,
    !!selectedVeterinarianId && !!selectedDate
  )

  // Merge available slots with the originally selected slot so it's always visible
  const mergedSlots = useMemo(() => {
    const originalSlotId = (appointment as any)?.SlotId || (appointment as any)?.slotId
    const originalStart = (appointment as any)?.appointmentTimeFrom || (appointment as any)?.startTime
    const originalEnd = (appointment as any)?.appointmentTimeTo || (appointment as any)?.endTime

    let slots: any[] = [...(availableSlots as any[])]

    if (originalSlotId || (originalStart && originalEnd)) {
      const byId = originalSlotId ? slots.find((s) => s.id === originalSlotId) : null
      const byTime = (!byId && originalStart && originalEnd)
        ? slots.find(
            (s) => s.startTime?.slice(0,5) === String(originalStart).slice(0,5) &&
                   s.endTime?.slice(0,5) === String(originalEnd).slice(0,5)
          )
        : null

      if (byId) {
        slots = slots.map((slot) => slot.id === (byId as any).id ? { ...slot, isOriginalAppointment: true } : slot)
      } else if (byTime) {
        slots = slots.map((slot) => slot.id === (byTime as any).id ? { ...slot, isOriginalAppointment: true } : slot)
      } else if (originalStart && originalEnd) {
        slots = [
          ...slots,
          {
            id: originalSlotId || `original-${appointment?.id || 'appointment'}`,
            startTime: originalStart,
            endTime: originalEnd,
            isOriginalAppointment: true,
            isInjected: true,
          },
        ]
      }
    }

    return slots
  }, [availableSlots, appointment, selectedDate, selectedVeterinarianId])

  // Auto-select a slot by time if no SlotId is set but an original time exists
  useEffect(() => {
    const currentSlotId = form.getValues("SlotId");
    if (currentSlotId) return;
    const currentStart = (appointment as any)?.appointmentTimeFrom || (appointment as any)?.startTime;
    const currentEnd = (appointment as any)?.appointmentTimeTo || (appointment as any)?.endTime;
    if (!currentStart || !currentEnd || !(availableSlots as any[])?.length) return;
    const match = (availableSlots as any[]).find(
      (s) => s.startTime?.slice(0,5) === String(currentStart).slice(0,5) && s.endTime?.slice(0,5) === String(currentEnd).slice(0,5)
    );
    if (match) {
      form.setValue("SlotId" as any, match.id as any);
      setSelectedSlot(match.id);
    }
  }, [availableSlots, appointment]);

  // Map to combobox options
  const clinicOptions = (clinicsResponse?.items || []).map(c => ({ value: c.id, label: c.name }))
  const patientOptions = (patientsResponse?.items || []).map((p: any) => ({ value: p.id, label: p.name || p.patientId || `${p.firstName || ''} ${p.lastName || ''}`.trim() }))
  const clientOptions = (clientsResponse?.items || []).filter(c => c.isActive).map((c: Client) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))
  const veterinarianOptions = (usersResponse?.items || []).filter((u: any) => u.roleName === 'Veterinarian' && (u as any).clinicId === selectedClinicId).map((u: any) => ({ value: u.id, label: `Dr. ${u.firstName} ${u.lastName}` }))
  const roomOptions = (roomsResponse?.items || []).filter((r: any) => r.isActive).map((r: any) => ({ value: r.id, label: r.name }))
  const appointmentTypeOptions = (appointmentTypes || []).filter((t: any) => t.isActive).map((t: any) => ({ value: t.appointmentTypeId, label: t.name }))

  // When appointment loads, prefill the form
  useEffect(() => {
    if (!appointment) return
    const slotId = (appointment as any).SlotId || (appointment as any).slotId || ""

    form.reset({
      ...appointment,
      appointmentDate: appointment.appointmentDate.split('T')[0],
      SlotId: slotId as any,
      status: appointment.status || 'scheduled'
    } as any)

    setSelectedSlot(slotId)
  }, [appointment, form])

  // Approve submit
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast({ title: "Appointment Approved", description: "Request approved and scheduled.", variant: "success" })
      onClose()
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to approve appointment", variant: "error" })
    }
  })

  const handleSlotClick = (slot: { id: string; startTime: string; endTime: string }) => {
    setSelectedSlot(slot.id)
    form.setValue("SlotId" as any, slot.id as any)
  }

  const formatTime = (t?: string) => {
    if (!t) return ''
    if (t.includes('T')) return t.split('T')[1].substring(0, 5)
    const parts = t.split(':')
    return `${parts[0]}:${parts[1]}`
  }

  const onSubmit = (data: AppointmentFormValues) => {
    const chosenSlotId = data.SlotId || selectedSlot || ""
    let appointmentTimeFrom: string | undefined = (appointment as any)?.appointmentTimeFrom || (appointment as any)?.startTime
    let appointmentTimeTo: string | undefined = (appointment as any)?.appointmentTimeTo || (appointment as any)?.endTime

    if (chosenSlotId) {
      const slot = (availableSlots as any[])?.find((s) => s.id === chosenSlotId)
      if (slot) {
        appointmentTimeFrom = slot.startTime
        appointmentTimeTo = slot.endTime
      }
    }

    const { SlotId, ...rest } = data as any
    updateAppointmentMutation.mutate({
      id: appointmentId,
      data: {
        ...rest,
        status: "scheduled",
        isRegistered: false,
        appointmentDate: new Date(data.appointmentDate).toISOString(),
        appointmentTimeFrom,
        appointmentTimeTo,
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-600">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading...
      </div>
    )
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
      <SheetHeader className="flex flex-row items-center border-b pb-2">
        <SheetTitle className="pr-2">Approve Appointment</SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="clinicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic</FormLabel>
                  <FormControl>
                    <Combobox options={clinicOptions} value={field.value} onValueChange={field.onChange} placeholder="Select clinic" />
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
                    <Combobox options={patientOptions} value={field.value} onValueChange={field.onChange} placeholder="Select patient" />
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
                    <Combobox options={clientOptions} value={field.value} onValueChange={field.onChange} placeholder="Select client" />
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
                    <Combobox options={veterinarianOptions} value={field.value} onValueChange={field.onChange} placeholder="Select veterinarian" />
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
                    <Combobox options={roomOptions} value={field.value} onValueChange={field.onChange} placeholder="Select room" />
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
                    <Combobox options={appointmentTypeOptions} value={field.value} onValueChange={field.onChange} placeholder="Select appointment type" />
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
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-2">
            <FormField
              control={form.control}
              name="SlotId"
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
                      ) : (mergedSlots as any[])?.length === 0 ? (
                        <div className="text-sm text-gray-500">No slots for this veterinarian on the selected date</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(mergedSlots as any[])
                            .slice()
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((slot: any) => {
                              const originalStart = (appointment as any)?.appointmentTimeFrom || (appointment as any)?.startTime;
                              const originalEnd = (appointment as any)?.appointmentTimeTo || (appointment as any)?.endTime;
                              const matchesOriginalTime = originalStart && originalEnd && (
                                String(slot.startTime).slice(0,5) === String(originalStart).slice(0,5) &&
                                String(slot.endTime).slice(0,5) === String(originalEnd).slice(0,5)
                              );
                              const hasExplicitSelection = Boolean(field.value || selectedSlot);
                              const isSelected = hasExplicitSelection
                                ? (selectedSlot === slot.id || field.value === slot.id)
                                : matchesOriginalTime;
                              
                              return (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => handleSlotClick(slot)}
                                  className={`rounded-full px-3 py-1 text-sm border transition-colors ${isSelected ? "bg-green-100 border-green-300 text-green-800" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
                                >
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
            </div>
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="theme-button text-white" 
              onClick={() => onSubmit(form.getValues())}
              disabled={updateAppointmentMutation.isPending}>
              {updateAppointmentMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Approve
            </Button>
          </SheetFooter>
        </form>
      </Form>
      </SheetContent>
    </Sheet>
  )
}


