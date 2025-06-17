"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search, Trash2, Pencil, XIcon } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Combobox } from "@/components/ui/combobox"
import { useGetAppointments } from "@/queries/appointment/get-appointment"
import { useDeleteAppointment } from "@/queries/appointment/delete-appointment"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useUpdateAppointment } from "@/queries/appointment/update-appointment"
import useAppointmentFilter from "./hooks/useAppointmentFilter"
import { DatePickerWithRangeV2 } from "../ui/custom/date/date-picker-with-range"
import { useRootContext } from "@/context/RootContext"
import { useGetAppointmentByPatientId } from "@/queries/appointment/get-appointment-by-patient-id"

interface Appointment {
  id: string;
  veterinarian?: {
    firstName?: string;
    lastName?: string;
  };
  patient?: {
    name?: string;
  };
  client?: {
    firstName?: string;
    lastName?: string;
  };
  status: string;
  appointmentType?: string;
}

export default function AppointmentList({ 
  onAppointmentClick,
  selectedPatientId
}: { 
  onAppointmentClick: (id: string) => void,
  selectedPatientId?: string 
}) {
  const { user, userType } = useRootContext()
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { searchParams, handleSearch, handleStatus, handleProvider, handleDate, removeAllFilters } = useAppointmentFilter();
  
  // Add useEffect to set today's date when component mounts
  useEffect(() => {
    handleDate("today", null);
  }, []);

  // Fetch appointments by patient ID if selectedPatientId is provided
  const { data: patientAppointments = [], isLoading: isLoadingPatientAppointments } = useGetAppointmentByPatientId(
    selectedPatientId || "" 
  );

  // Fetch all appointments when no patient is selected
  const { data: allAppointments = [], isLoading: isLoadingAllAppointments } = useGetAppointments(
    searchParams
  );

  // Debugging logs
  useEffect(() => {
    if (selectedPatientId) {
      console.log("Using patient-specific appointments for patient ID:", selectedPatientId);
      console.log("Patient appointments:", patientAppointments);
    } else {
      console.log("Using all appointments");
    }
  }, [selectedPatientId, patientAppointments, allAppointments]);

  // Use patient-specific appointments when selectedPatientId is provided, otherwise use all appointments
  const appointments = selectedPatientId ? patientAppointments : allAppointments;
  const isLoading = selectedPatientId ? isLoadingPatientAppointments : isLoadingAllAppointments;

  const deleteAppointmentMutation = useDeleteAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  })

  // Add update mutation
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  })

  // // Add create visit mutation
  // const createVisitMutation = useCreateVisit()

  // --- Start: Data Enrichment ---
  // The API now provides nested user data, so we directly enrich the appointments
  const enrichedAppointments = useMemo(() => {
    // Ensure appointments is an array before mapping
    if (!Array.isArray(appointments)) {
      return [];
    }

    return appointments.map(appointment => {
      const patientName = appointment.patient?.name || 'N/A';
      const ownerName = `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim() || 'N/A';
      const providerName = `${appointment.veterinarian?.firstName || ''} ${appointment.veterinarian?.lastName || ''}`.trim() || 'N/A';

      return {
        ...appointment,
        patient: patientName,
        owner: ownerName,
        provider: providerName,
      };
    });
  }, [appointments]); // Re-run when appointments data changes
  // --- End: Data Enrichment ---

  const scheduledCount = enrichedAppointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length;
  const checkedInCount = enrichedAppointments.filter(
    (a) => a.status === "in_progress"
  ).length;
  const completedCount = enrichedAppointments.filter(
    (a) => a.status === "completed"
  ).length;
  const cancelledCount = enrichedAppointments.filter(
    (a) => a.status === "cancelled"
  ).length;
  const allCount = enrichedAppointments.length;

  
  // Calculate today's appointments count
  const todayAppointmentsCount = enrichedAppointments.length; 

  // Calculate today's completed appointments
  const todayCompletedCount = enrichedAppointments.filter(
    (a) => a.status === "completed"
  ).length;

  // Provider options
  const providerOptions = useMemo(() => {
    const uniqueProviders = new Set<string>()
    appointments.forEach((appointment: Appointment) => {
      const providerName = `${appointment.veterinarian?.firstName || ''} ${appointment.veterinarian?.lastName || ''}`.trim()
      if (providerName) {
        uniqueProviders.add(providerName)
      }
    })

    return [
      { value: "", label: "All Providers" },
      ...Array.from(uniqueProviders).map(provider => ({
        value: provider,
        label: provider
      }))
    ]
  }, [appointments])

  // Status options
  // You might want to dynamically generate these options based on the fetched appointments.
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "In Room", label: "In Room" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ]

  // Filter appointments based on active tab and selected filters
  const filteredAppointments = useMemo(() => {
    let filtered = enrichedAppointments

    // Apply status filter based on active tab
    if (activeTab === "all") {
      filtered = enrichedAppointments
    } else if (activeTab === "scheduled") {
      filtered = enrichedAppointments.filter(
        (a) => a.status === "scheduled" || a.status === "confirmed"
      )
    } else if (activeTab === "checked-in") {
      filtered = enrichedAppointments.filter((a) => a.status === "in_progress")
    } else if (activeTab === "completed") {
      filtered = enrichedAppointments.filter((a) => a.status === "completed")
    } else if (activeTab === "cancelled") {
      filtered = enrichedAppointments.filter((a) => a.status === "cancelled")
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(appointment =>
        appointment.patient?.toLowerCase().includes(query) ||
        appointment.owner?.toLowerCase().includes(query) ||
        appointment.appointmentType?.toLowerCase().includes(query)
      )
    }

    // Apply provider filter
    if (selectedProvider) {
      filtered = filtered.filter(appointment =>
        `${appointment.veterinarian?.firstName || ''} ${appointment.veterinarian?.lastName || ''}`.trim() === selectedProvider
      )
    }

    return filtered
  }, [enrichedAppointments, activeTab, searchQuery, selectedProvider])

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
      case "Cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "theme-badge-neutral"
    }
  }

  const handleDefaultState = () => {
    if (userType.isProvider) {
      setSelectedProvider(user?.firstName + " " + user?.lastName)
    }
  }

  useEffect(() => {
    handleDefaultState()
  }, [userType])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "startTime",
      header: "Time",
    },
    {
      accessorKey: "patient",
      header: "Patient",
    },
    {
      accessorKey: "owner",
      header: "Owner",
    },
    {
      accessorKey: "appointmentType",
      header: "Visit Type",
    },
    {
      accessorKey: "provider",
      header: "Provider",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getStatusBadgeClass(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => onAppointmentClick(row.original.id.toString())}>
            View
          </Button>
          {/* For scheduled or confirmed: show Check In and Cancel */}
          {(row.original.status === "scheduled" || row.original.status === "confirmed") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="theme-button-outline"
                onClick={() => {
                  // Update appointment status
                  updateAppointmentMutation.mutate({
                    id: row.original.id.toString(),
                    data: {
                      id: row.original.id,
                      clinicId: row.original.clinicId,
                      patientId: row.original.patientId,
                      clientId: row.original.clientId,
                      veterinarianId: row.original.veterinarianId,
                      roomId: row.original.roomId,
                      appointmentDate: row.original.appointmentDate,
                      startTime: row.original.startTime,
                      endTime: row.original.endTime,
                      appointmentType: row.original.appointmentType,
                      reason: row.original.reason,
                      status: "in_progress",
                      notes: row.original.notes,
                      createdBy: row.original.createdBy,
                    }
                  });
                  
                  // Also create a visit with intake flags set to false
                  // createVisitMutation.mutate({
                  //   appointmentId: row.original.id.toString(),
                  //   patientId: row.original.patientId,
                  //   isIntakeCompleted: false,
                  //   isComplaintsCompleted: false,
                  //   isMedicalHistoryCompleted: false
                  // });
                }}
                disabled={updateAppointmentMutation.isPending}
              >
                Check In
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateAppointmentMutation.mutate({
                  id: row.original.id.toString(),
                  data: {
                    id: row.original.id,
                    clinicId: row.original.clinicId,
                    patientId: row.original.patientId,
                    clientId: row.original.clientId,
                    veterinarianId: row.original.veterinarianId,
                    roomId: row.original.roomId,
                    appointmentDate: row.original.appointmentDate,
                    startTime: row.original.startTime,
                    endTime: row.original.endTime,
                    appointmentType: row.original.appointmentType,
                    reason: row.original.reason,
                    status: "cancelled",
                    notes: row.original.notes,
                    createdBy: row.original.createdBy,
                  }
                })}
                disabled={updateAppointmentMutation.isPending}
              >
                Cancel
              </Button>
            </>
          )}
          {/* For in_progress: show Check Out and Cancel */}
          {row.original.status === "in_progress" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="theme-button-outline"
                onClick={() => updateAppointmentMutation.mutate({
                  id: row.original.id.toString(),
                  data: {
                    id: row.original.id,
                    clinicId: row.original.clinicId,
                    patientId: row.original.patientId,
                    clientId: row.original.clientId,
                    veterinarianId: row.original.veterinarianId,
                    roomId: row.original.roomId,
                    appointmentDate: row.original.appointmentDate,
                    startTime: row.original.startTime,
                    endTime: row.original.endTime,
                    appointmentType: row.original.appointmentType,
                    reason: row.original.reason,
                    status: "completed",
                    notes: row.original.notes,
                    createdBy: row.original.createdBy,
                  }
                })}
                disabled={updateAppointmentMutation.isPending}
              >
                Check Out
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateAppointmentMutation.mutate({
                  id: row.original.id.toString(),
                  data: {
                    id: row.original.id,
                    clinicId: row.original.clinicId,
                    patientId: row.original.patientId,
                    clientId: row.original.clientId,
                    veterinarianId: row.original.veterinarianId,
                    roomId: row.original.roomId,
                    appointmentDate: row.original.appointmentDate,
                    startTime: row.original.startTime,
                    endTime: row.original.endTime,
                    appointmentType: row.original.appointmentType,
                    reason: row.original.reason,
                    status: "cancelled",
                    notes: row.original.notes,
                    createdBy: row.original.createdBy,
                  }
                })}
                disabled={updateAppointmentMutation.isPending}
              >
                Cancel
              </Button>
            </>
          )}
          {/* Keep Delete button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => deleteAppointmentMutation.mutate(row.original.id.toString())}
            disabled={deleteAppointmentMutation.isPending}
          >
            Delete
          </Button>
          {/* Keep SOAP buttons */}
          {row.original.status === "In Progress" && (
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-200 text-gray-500 border-gray-300 opacity-50"
              disabled
            >
              SOAP
            </Button>
          )}
          {row.original.status === "Completed" && (
            <Button variant="outline" size="sm" className="theme-button-outline">
              SOAP
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleDelete = async (id: string) => {
    try {
      await deleteAppointmentMutation.mutateAsync(id)
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-3 ">
          <DatePickerWithRangeV2
            date={{
              from: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
              to: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined
            }}
            setDate={async (date) => {
              try {
                if (date?.from && date?.to) {
                  handleDate(date.from.toISOString(), date.to.toISOString());
                }
              } catch (error) {
                console.error('Error updating date range:', error);
              }
            }}
            className="h-full"
          />
          {!userType.isProvider && (
            <div className="w-[400px]">
              <Combobox
                options={providerOptions}
                value={selectedProvider}
                onValueChange={setSelectedProvider}
                placeholder="Select Provider"
                searchPlaceholder="Search providers..."
                emptyText="No providers found."
              />
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProvider("")
              setSearchQuery("")
              removeAllFilters()
            }}
          >
            <XIcon className="w-4 h-4" /> Clear Filters
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto mb-6 bg-white dark:bg-slate-800 rounded-lg">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-medium ${activeTab === "all"
            ? "theme-active text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
        >
          All ({allCount})
        </button>
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`px-6 py-3 text-sm font-medium ${activeTab === "scheduled"
            ? "theme-active text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
        >
          Scheduled ({scheduledCount})
        </button>
        <button
          onClick={() => setActiveTab("checked-in")}
          className={`px-6 py-3 text-sm font-medium ${activeTab === "checked-in"
            ? "theme-active text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
        >
          Checked In ({checkedInCount})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 text-sm font-medium ${activeTab === "completed"
            ? "theme-active text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-6 py-3 text-sm font-medium ${activeTab === "cancelled"
            ? "theme-active text-white"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredAppointments}
        searchColumn="patient"
        searchPlaceholder="Search appointments..."
        page={currentPage}
        pageSize={pageSize}
        totalPages={Math.ceil(filteredAppointments.length / pageSize)}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

    </div>
  )
}
