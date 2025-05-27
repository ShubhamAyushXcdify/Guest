"use client"

import { useState }  from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search } from "lucide-react"


export default function AppointmentList( {onAppointmentClick}: {onAppointmentClick: (id: string) => void} ) {
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

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

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === "all") return true
    if (activeTab === "scheduled") return appointment.status === "Scheduled"
    if (activeTab === "checked-in") return appointment.status === "In Room"
    if (activeTab === "completed") return appointment.status === "Completed"
    if (activeTab === "cancelled") return appointment.status === "Cancelled"
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
            <Button variant="outline" className="w-full justify-between">
              Provider: All <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="relative">
            <Button variant="outline" className="w-full justify-between">
              Status: All <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Filter</Button>
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

      {/* Appointments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Patient
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Owner
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Visit Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Provider
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-slate-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.patient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.owner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.visitType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.provider}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusBadgeClass(appointment.status)}>{appointment.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                  {appointment.status === "Scheduled" && (
                    <Button variant="outline" size="sm" className="theme-button-outline">
                      Check In
                    </Button>
                  )}
                  {appointment.status === "In Room" && (
                    <Button variant="outline" size="sm" className="theme-button-outline">
                      Check Out
                    </Button>
                  )}
                  {appointment.status === "In Progress" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-200 text-gray-500 border-gray-300 opacity-50"
                      disabled
                    >
                      SOAP
                    </Button>
                  )}
                  {appointment.status === "Completed" && (
                    <Button variant="outline" size="sm" className="theme-button-outline">
                      SOAP
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <nav className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(1)}
            className={currentPage === 1 ? "theme-button text-white" : ""}
          >
            1
          </Button>
          <Button
            variant={currentPage === 2 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(2)}
            className={currentPage === 2 ? "theme-button text-white" : ""}
          >
            2
          </Button>
          <Button
            variant={currentPage === 3 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(3)}
            className={currentPage === 3 ? "theme-button text-white" : ""}
          >
            3
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === 3}
          >
            Next
          </Button>
        </nav>
      </div>
    </div>
  )
}
