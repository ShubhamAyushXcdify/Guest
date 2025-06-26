"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
import { User } from "@/hooks/useContentLayout"
import { useGetAppointmentByPatientId } from "@/queries/appointment/get-appointment-by-patient-id"
import { useGetUsers, User as ApiUser } from "@/queries/users/get-users"

// Extended API user type with clinicId
interface ExtendedUser extends ApiUser {
  clinicId?: string;
}

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
  const { user, userType, IsAdmin, clinic } = useRootContext()
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { searchParams, handleSearch, handleStatus, handleProvider, handleDate, removeAllFilters } = useAppointmentFilter();
  
  // Ref to track if dates have been initialized
  const datesInitializedRef = useRef(false);
  
  // Fetch veterinarians from users API - if admin, get all; if not admin, filter by clinic
  const { data: usersData } = useGetUsers(1, 100, '', IsAdmin ? '' : clinic?.id || '', true, '');
  
  // Filter users to get only veterinarians
  const veterinarians = useMemo(() => {
    if (!usersData?.items) return [];
    
    const vets = usersData.items.filter(user => user.roleName === "Veterinarian") as ExtendedUser[];
    
    // If not admin, we don't need to filter further since we already filtered by clinicId in the API call
    return vets;
  }, [usersData]);

  // Fetch appointments by patient ID if selectedPatientId is provided
  const { data: patientAppointments = [], isLoading: isLoadingPatientAppointments } = useGetAppointmentByPatientId(
    selectedPatientId || "" 
  );

  // Fetch all appointments when no patient is selected
  const { data: allAppointments = [], isLoading: isLoadingAllAppointments } = useGetAppointments({
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    search: searchParams.search,
    status: searchParams.status,
    provider: searchParams.provider,
    clinicId: searchParams.clinicId,
    patientId: searchParams.patientId,
    clientId: searchParams.clientId,
    veterinarianId: userType.isProvider ? user?.id : searchParams.veterinarianId,
    roomId: searchParams.roomId,
    pageNumber: currentPage,
    pageSize: pageSize,
  });
  
  // Use patient-specific appointments when selectedPatientId is provided, otherwise use all appointments
  const appointments = selectedPatientId ? patientAppointments : allAppointments;
  const isLoading = selectedPatientId ? isLoadingPatientAppointments : isLoadingAllAppointments;

  // Extract pagination information from API response
  const paginationInfo = useMemo(() => {
    if (!selectedPatientId && allAppointments && typeof allAppointments === 'object') {
      return {
        totalCount: allAppointments.totalCount || 0,
        pageNumber: allAppointments.pageNumber || 1,
        pageSize: allAppointments.pageSize || 10,
        totalPages: allAppointments.totalPages || 1,
      };
    }
    return {
      totalCount: 0,
      pageNumber: currentPage,
      pageSize: pageSize,
      totalPages: 1,
    };
  }, [allAppointments, currentPage, pageSize, selectedPatientId]);

  const appointmentItems = useMemo(() => {
    if (selectedPatientId) {
      return patientAppointments;
    }
    
    // Check if allAppointments has items property
    if (allAppointments && allAppointments.items && Array.isArray(allAppointments.items)) {
      return allAppointments.items;
    }
    
    // Fallback if allAppointments itself is an array
    if (Array.isArray(allAppointments)) {
      return allAppointments;
    }
    
    // Default empty array if no data
    return [];
  }, [allAppointments, patientAppointments, selectedPatientId]);

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
    if (!Array.isArray(appointmentItems)) {
      return [];
    }

    return appointmentItems.map(appointment => {
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
  }, [appointmentItems]); // Re-run when appointments data changes
  // --- End: Data Enrichment ---

  // Use the enriched appointments directly and filter in the frontend
  const filteredAppointments = useMemo(() => {
    let filtered = enrichedAppointments;

    // Apply status filter based on active tab
    if (activeTab === "all") {
      filtered = enrichedAppointments;
    } else if (activeTab === "scheduled") {
      filtered = enrichedAppointments.filter(
        (a) => a.status === "scheduled" || a.status === "confirmed"
      );
    } else if (activeTab === "checked-in") {
      filtered = enrichedAppointments.filter((a) => a.status === "in_progress");
    } else if (activeTab === "completed") {
      filtered = enrichedAppointments.filter((a) => a.status === "completed");
    } else if (activeTab === "cancelled") {
      filtered = enrichedAppointments.filter((a) => a.status === "cancelled");
    }

    // Apply search filter client-side
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.patient?.toLowerCase().includes(query) ||
        appointment.owner?.toLowerCase().includes(query) ||
        appointment.appointmentType?.toLowerCase().includes(query)
      );
    }
    
    // Note: Provider filtering is now handled by the API using veterinarianId parameter
    // We don't need to filter by provider name client-side anymore

    return filtered;
  }, [enrichedAppointments, activeTab, searchQuery]);

  // Update counts based on filtered data
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

  // Provider options from users API
  const providerOptions = useMemo(() => {
    // Create options from veterinarians data
    const options = [
      { value: "", label: "All Providers" },
      ...veterinarians.map(vet => ({
        value: vet.id, // Use the veterinarian's ID as the value
        label: `${vet.firstName} ${vet.lastName}`.trim()
      }))
    ];
    return options;
  }, [veterinarians]);

  // Handle provider selection
  const handleProviderSelection = (providerId: string) => {
    setSelectedProvider(providerId);
    
    // Update search parameters to include veterinarianId
    const params: any = { 
      veterinarianId: providerId || null,
      pageNumber: 1 // Reset to page 1 when changing provider
    };
    
    // Remove the provider parameter as we're using veterinarianId instead
    if (searchParams.provider) {
      params.provider = null;
    }
    
    handleProvider(providerId);
  };

  const handleDefaultState = () => {
    // Set provider filter if user is a provider
    if (userType.isProvider && user?.id) {
      setSelectedProvider(user.id);
      handleProviderSelection(user.id);
    }
  }

  // Function to initialize today's date filter
  const initializeTodayDateFilter = () => {
    // Only set the date filter if it's not already set and we haven't initialized it yet
    if ((!searchParams.dateFrom || !searchParams.dateTo) && !datesInitializedRef.current) {
      const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
      handleDate(today, today);
      datesInitializedRef.current = true;
    }
  }

  useEffect(() => {
    handleDefaultState();
  }, [userType, user]);

  // Initialize with today's date when component mounts
  useEffect(() => {
    initializeTodayDateFilter();
  }, []);

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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "startTime",
      header: "Time",
      cell: ({ row }) => {
        const appointment = row.original;
        
        // Check if roomSlot and startTime exist
        if (appointment.roomSlot && appointment.roomSlot.startTime) {
          // Format time to HH:MM
          const timeValue = appointment.roomSlot.startTime;
          
          // Handle HH:MM:SS format
          if (timeValue.includes(':')) {
            const timeParts = timeValue.split(':');
            return `${timeParts[0]}:${timeParts[1]}`;
          }
          
          return timeValue;
        }
        
        // Fallback to direct startTime if exists
        if (appointment.startTime) {
          return appointment.startTime;
        }
        
        return 'N/A';
      },
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
          {/* For in_progress: show Cancel only */}
          {row.original.status === "in_progress" && (
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

  // Update page handling
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Add pageNumber and pageSize to URL params
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('pageNumber', page.toString());
    urlParams.set('pageSize', pageSize.toString());
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  // Update pageSize handling
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    // Add pageNumber and pageSize to URL params
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('pageNumber', '1'); // Reset to page 1
    urlParams.set('pageSize', size.toString());
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-3 mb-6">
        <div className="flex items-center gap-3 ">
          <DatePickerWithRangeV2
            date={{
              from: searchParams.dateFrom ? new Date(searchParams.dateFrom) : new Date(),
              to: searchParams.dateTo ? new Date(searchParams.dateTo) : new Date()
            }}
            setDate={async (date) => {
              try {
                if (date?.from && date?.to) {
                  // Format dates as YYYY-MM-DD
                  const formattedFrom = date.from.toISOString().split('T')[0];
                  const formattedTo = date.to.toISOString().split('T')[0];
                  
                  // Reset to page 1 and set date range
                  setCurrentPage(1);
                  handleDate(formattedFrom, formattedTo);
                } else {
                  // If date is cleared, reset date filters
                  setCurrentPage(1);
                  handleDate(null, null);
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
                onValueChange={handleProviderSelection}
                placeholder="Select Provider"
                searchPlaceholder="Search veterinarians..."
                emptyText="No veterinarians found."
              />
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProvider("")
              setSearchQuery("")
              setActiveTab("all")
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
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

    </div>
  )
}
