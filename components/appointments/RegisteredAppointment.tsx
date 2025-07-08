"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Combobox } from "@/components/ui/combobox"
import { DatePicker } from "@/components/ui/datePicker"
import { Textarea } from "@/components/ui/textarea"
import { ColumnDef } from "@tanstack/react-table"
import { useGetAppointments } from "@/queries/appointment/get-appointment"
import { useUpdateAppointment } from "@/queries/appointment/update-appointment"
import { useGetUsers } from "@/queries/users/get-users"
import { useGetRoomsByClinicId } from "@/queries/rooms/get-room-by-clinic-id"
import { useGetSlotByRoomId } from "@/queries/slots/get-slot-by-roomId"
import { useGetAppointmentTypeByClinicId } from "@/queries/appointmentType/get-appointmentType-by-clinicId"
import { useRootContext } from '@/context/RootContext'
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Clock, User, Calendar, MapPin, CheckCircle, AlertCircle } from "lucide-react"

// Define the form schema for accepting appointments
const acceptAppointmentSchema = z.object({
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
  notes: z.string().optional(),
})

type AcceptAppointmentFormValues = z.infer<typeof acceptAppointmentSchema>

interface RegisteredAppointmentProps {}

const RegisteredAppointment: React.FC<RegisteredAppointmentProps> = () => {
  const { toast } = useToast()
  const { user, clinic } = useRootContext()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isAcceptSheetOpen, setIsAcceptSheetOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Fetch all appointments and filter for registered/pending ones
  const { data: appointmentsData, isLoading } = useGetAppointments({
    search: null,
    status: null,
    provider: null,
    dateFrom: new Date().toISOString().split('T')[0], // Today
    dateTo: new Date().toISOString().split('T')[0], // Today
    clinicId: clinic?.id || '',
    patientId: null,
    clientId: null,
    veterinarianId: null,
    roomId: null,
    pageNumber: currentPage,
    pageSize: pageSize,
  })

  // Filter appointments to show only those that need assignment (no veterinarian assigned)
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData || typeof appointmentsData !== 'object') return []
    const items = appointmentsData.items || []
    
    // Filter for appointments that don't have a veterinarian assigned or are in a "pending" state
    return items.filter((appointment: any) => 
      !appointment.veterinarianId || 
      appointment.status === "pending" ||
      appointment.status === "registered" ||
      (appointment.status === "scheduled" && !appointment.roomId)
    )
  }, [appointmentsData])

  // Use filtered appointments for display
  const appointments = filteredAppointments

  const paginationInfo = useMemo(() => {
    return {
      totalCount: appointments.length,
      pageNumber: currentPage,
      pageSize: pageSize,
      totalPages: Math.ceil(appointments.length / pageSize),
    }
  }, [appointments, currentPage, pageSize])

  // Form for accepting appointments
  const form = useForm<AcceptAppointmentFormValues>({
    resolver: zodResolver(acceptAppointmentSchema),
    defaultValues: {
      veterinarianId: "",
      roomId: "",
      appointmentDate: new Date(),
      slotId: "",
      appointmentTypeId: "",
      notes: "",
    },
  })

  // Get selected room ID for slots
  const selectedRoomId = form.watch("roomId")
  const selectedDate = form.watch("appointmentDate")

  // Fetch data for the form
  const { data: usersResponse = { items: [] } } = useGetUsers(1, 100)
  const { data: rooms, isLoading: isLoadingRooms } = useGetRoomsByClinicId(clinic?.id || "")
  const { data: appointmentTypes = [], isLoading: isLoadingAppointmentTypes } = useGetAppointmentTypeByClinicId(clinic?.id || "", !!clinic?.id)
  const { data: slotsData, isLoading: isLoadingSlots } = useGetSlotByRoomId(1, 100, '', selectedRoomId)

  // Initialize slots with proper default value
  const slots = slotsData || { pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0, items: [] }

  // Transform data for form options
  const veterinarianOptions = (usersResponse.items || [])
    .filter(user => user.roleName === "Veterinarian" && (user as any).clinicId === clinic?.id)
    .map(vet => ({
      value: vet.id,
      label: `Dr. ${vet.firstName} ${vet.lastName}`
    }))

  const roomOptions = isLoadingRooms 
    ? [] 
    : (rooms || []).filter((room: any) => room.isActive).map((room: any) => ({
      value: room.id,
      label: `${room.name} (${room.roomType})`
    }))

  const appointmentTypeOptions = isLoadingAppointmentTypes
    ? []
    : (appointmentTypes || []).filter((type) => type.isActive).map((type) => ({
      value: type.appointmentTypeId,
      label: type.name
    }))

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    
    if (timeString.length <= 5) return timeString
    
    try {
      if (timeString.includes('T')) {
        return timeString.split('T')[1].substring(0, 5)
      }
      
      if (timeString.includes(':')) {
        const timeParts = timeString.split(':')
        return `${timeParts[0]}:${timeParts[1]}`
      }
      
      return timeString
    } catch (e) {
      return timeString
    }
  }

  // Handle slot selection
  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId)
    form.setValue("slotId", slotId)
  }

  // Update appointment mutation
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment accepted successfully",
      })
      setIsAcceptSheetOpen(false)
      setSelectedAppointment(null)
      form.reset()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept appointment",
        variant: "destructive",
      })
    }
  })

  // Handle accepting appointment
  const handleAcceptAppointment = (data: AcceptAppointmentFormValues) => {
    if (!selectedAppointment) return

    const formattedData = {
      id: selectedAppointment.id,
      clinicId: selectedAppointment.clinicId,
      patientId: selectedAppointment.patientId,
      clientId: selectedAppointment.clientId,
      veterinarianId: data.veterinarianId,
      roomId: data.roomId,
      appointmentDate: data.appointmentDate.toISOString().split('T')[0],
      roomSlotId: data.slotId,
      appointmentTypeId: data.appointmentTypeId,
      reason: selectedAppointment.reason,
      status: "scheduled", // Change status to scheduled when accepted
      notes: data.notes || selectedAppointment.notes,
      createdBy: user?.id,
    }

    updateAppointmentMutation.mutate({
      id: selectedAppointment.id.toString(),
      data: formattedData
    })
  }

  // Handle opening accept sheet
  const handleAcceptClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsAcceptSheetOpen(true)
    
    // Pre-fill form with appointment data
    form.reset({
      veterinarianId: "",
      roomId: "",
      appointmentDate: new Date(),
      slotId: "",
      appointmentTypeId: appointment.appointmentTypeId || "",
      notes: appointment.notes || "",
    })
  }

  // Table columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original.patient
        return typeof patient === 'object' ? patient.name : patient || 'N/A'
      },
    },
    {
      accessorKey: "client",
      header: "Owner",
      cell: ({ row }) => {
        const client = row.original.client
        if (client) {
          return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
        }
        return 'N/A'
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.original.reason || 'N/A',
    },
    {
      accessorKey: "appointmentType",
      header: "Type",
      cell: ({ row }) => {
        const appointmentType = row.original.appointmentType
        return typeof appointmentType === 'object' && appointmentType?.name 
          ? appointmentType.name 
          : appointmentType || 'N/A'
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          onClick={() => handleAcceptClick(row.original)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Accept
        </Button>
      ),
    },
  ]

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registered Appointments Queue</h1>
          <p className="text-gray-600">Manage pending appointment registrations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>{paginationInfo.totalCount} pending registrations</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Today's Registrations</p>
                <p className="text-2xl font-bold text-blue-600">{paginationInfo.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{filteredAppointments.filter((a: any) => a.status === "registered").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Ready to Accept</p>
                <p className="text-2xl font-bold text-green-600">{filteredAppointments.filter((a: any) => a.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Registered Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={appointments}
            searchColumn="patient"
            searchPlaceholder="Search by patient name..."
            onSearch={handleSearch}
            page={currentPage}
            pageSize={pageSize}
            totalPages={paginationInfo.totalPages}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>

      {/* Accept Appointment Sheet */}
      <Sheet open={isAcceptSheetOpen} onOpenChange={setIsAcceptSheetOpen}>
        <SheetContent className="w-[95%] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Accept Appointment</SheetTitle>
          </SheetHeader>

          {selectedAppointment && (
            <div className="mt-6">
              {/* Appointment Details */}
              {/* <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Patient:</span>
                    <p>{typeof selectedAppointment.patient === 'object' ? selectedAppointment.patient.name : selectedAppointment.patient}</p>
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span>
                    <p>{selectedAppointment.client ? `${selectedAppointment.client.firstName} ${selectedAppointment.client.lastName}` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Reason:</span>
                    <p>{selectedAppointment.reason || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p>{typeof selectedAppointment.appointmentType === 'object' ? selectedAppointment.appointmentType.name : selectedAppointment.appointmentType}</p>
                  </div>
                </div>
              </div> */}

              {/* Assignment Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAcceptAppointment)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
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
                                field.onChange(value)
                                setSelectedSlot(null)
                                form.setValue("slotId", "")
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
                      name="appointmentTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appointment Type</FormLabel>
                          <FormControl>
                            <Combobox
                              options={appointmentTypeOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={isLoadingAppointmentTypes ? "Loading types..." : "Select appointment type"}
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
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        
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
                        )
                      }}
                    />
                  </div>

                  {/* Slot selection */}
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
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                  Loading available slots...
                                </div>
                              ) : slots.items.filter(slot => slot.isAvailable).length === 0 ? (
                                <div className="text-sm text-gray-500">
                                  No available slots for this room
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {slots.items
                                    .filter(slot => slot.isAvailable)
                                    .map((slot: any) => (
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

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <SheetFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAcceptSheetOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updateAppointmentMutation.isPending}
                    >
                      {updateAppointmentMutation.isPending ? "Accepting..." : "Accept Appointment"}
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default RegisteredAppointment