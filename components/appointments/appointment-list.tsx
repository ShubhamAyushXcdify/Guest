"use client"

import { useState }  from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Combobox } from "@/components/ui/combobox"

export default function AppointmentList( {onAppointmentClick}: {onAppointmentClick: (id: string) => void} ) {
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Provider options
  const providerOptions = [
    { value: "", label: "All Providers" },
    { value: "Dr. Sarah Johnson", label: "Dr. Sarah Johnson" },
    { value: "Dr. Michael Chen", label: "Dr. Michael Chen" },
  ]

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "In Room", label: "In Room" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ]

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      time: "8:30 AM",
      patient: "Bella (Cat)",
      owner: "Sarah Johnson",
      visitType: "Vaccination",
      provider: "Dr. Sarah Johnson",
      status: "In Room",
    },
    {
      id: 2,
      time: "9:15 AM",
      patient: "Max (Dog)",
      owner: "John Smith",
      visitType: "Check-up",
      provider: "Dr. Michael Chen",
      status: "Completed",
    },
    {
      id: 3,
      time: "10:00 AM",
      patient: "Charlie (Dog)",
      owner: "Robert Thompson",
      visitType: "Dental",
      provider: "Dr. Sarah Johnson",
      status: "Completed",
    },
    {
      id: 4,
      time: "11:30 AM",
      patient: "Daisy (Rabbit)",
      owner: "Emily Wilson",
      visitType: "Nail Trim",
      provider: "Dr. Michael Chen",
      status: "Completed",
    },
    {
      id: 5,
      time: "1:00 PM",
      patient: "Oscar (Cat)",
      owner: "Maria Rodriguez",
      visitType: "Surgery",
      provider: "Dr. Sarah Johnson",
      status: "In Progress",
    },
    {
      id: 6,
      time: "2:30 PM",
      patient: "Rocky (Dog)",
      owner: "James Miller",
      visitType: "Wound Check",
      provider: "Dr. Michael Chen",
      status: "Scheduled",
    },
    {
      id: 7,
      time: "3:15 PM",
      patient: "Luna (Cat)",
      owner: "Sarah Wilson",
      visitType: "Check-up",
      provider: "Dr. Sarah Johnson",
      status: "Scheduled",
    },
    {
      id: 8,
      time: "4:00 PM",
      patient: "Cooper (Dog)",
      owner: "David Brown",
      visitType: "Allergy Consult",
      provider: "Dr. Michael Chen",
      status: "Scheduled",
    },
  ]

  // Filter appointments based on active tab and selected filters
  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by tab
    if (activeTab === "all") return true
    if (activeTab === "scheduled") return appointment.status === "Scheduled"
    if (activeTab === "checked-in") return appointment.status === "In Room"
    if (activeTab === "completed") return appointment.status === "Completed"
    if (activeTab === "cancelled") return appointment.status === "Cancelled"

    // Filter by provider
    if (selectedProvider && appointment.provider !== selectedProvider) return false

    // Filter by status
    if (selectedStatus && appointment.status !== selectedStatus) return false

    return true
  })

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
      accessorKey: "time",
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
      accessorKey: "visitType",
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
          {row.original.status === "Scheduled" && (
            <Button variant="outline" size="sm" className="theme-button-outline">
              Check In
            </Button>
          )}
          {row.original.status === "In Room" && (
            <Button variant="outline" size="sm" className="theme-button-outline">
              Check Out
            </Button>
          )}
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

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder="Search appointments..." className="pl-9" />
          </div>
          <div className="relative">
            <Button variant="outline" className="w-full justify-between">
              Date: Today <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="relative">
            <Combobox
              options={providerOptions}
              value={selectedProvider}
              onValueChange={setSelectedProvider}
              placeholder="Select Provider"
              searchPlaceholder="Search providers..."
              emptyText="No providers found."
            />
          </div>
          <div className="relative">
            <Combobox
              options={statusOptions}
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder="Select Status"
              searchPlaceholder="Search statuses..."
              emptyText="No statuses found."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => {
            setSelectedProvider("")
            setSelectedStatus("")
          }}>Clear Filters</Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto mb-6 bg-white dark:bg-slate-800 rounded-lg">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "all"
              ? "theme-active text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          All (28)
        </button>
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "scheduled"
              ? "theme-active text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Scheduled (14)
        </button>
        <button
          onClick={() => setActiveTab("checked-in")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "checked-in"
              ? "theme-active text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Checked In (8)
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "completed"
              ? "theme-active text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Completed (6)
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === "cancelled"
              ? "theme-active text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Cancelled
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
