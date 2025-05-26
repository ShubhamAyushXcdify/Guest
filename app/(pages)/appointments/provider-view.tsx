"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function ProviderView() {
  // Mock provider data
  const providers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Veterinarian",
      specialty: "Small Animals",
      appointments: 8,
      completed: 3,
      inProgress: 1,
      scheduled: 4,
      avatar: "/diverse-avatars.png",
      initials: "SJ",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      role: "Veterinarian",
      specialty: "Surgery",
      appointments: 6,
      completed: 2,
      inProgress: 1,
      scheduled: 3,
      avatar: "/diverse-avatars.png",
      initials: "MC",
    },
    {
      id: 3,
      name: "Dr. Emily Wilson",
      role: "Veterinarian",
      specialty: "Exotic Animals",
      appointments: 5,
      completed: 2,
      inProgress: 0,
      scheduled: 3,
      avatar: "/diverse-avatars.png",
      initials: "EW",
    },
    {
      id: 4,
      name: "Dr. James Miller",
      role: "Veterinary Technician",
      specialty: "Dental",
      appointments: 7,
      completed: 4,
      inProgress: 1,
      scheduled: 2,
      avatar: "/diverse-avatars.png",
      initials: "JM",
    },
  ]

  // Mock appointments for the selected provider
  const providerAppointments = [
    {
      id: 1,
      time: "8:30 AM",
      patient: "Bella (Cat)",
      owner: "Sarah Johnson",
      visitType: "Vaccination",
      status: "In Room",
    },
    {
      id: 2,
      time: "10:00 AM",
      patient: "Charlie (Dog)",
      owner: "Robert Thompson",
      visitType: "Dental",
      status: "Completed",
    },
    {
      id: 3,
      time: "1:00 PM",
      patient: "Oscar (Cat)",
      owner: "Maria Rodriguez",
      visitType: "Surgery",
      status: "In Progress",
    },
    {
      id: 4,
      time: "3:15 PM",
      patient: "Luna (Cat)",
      owner: "Sarah Wilson",
      visitType: "Check-up",
      status: "Scheduled",
    },
  ]

  const [selectedProvider, setSelectedProvider] = useState(providers[0])

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
      default:
        return "theme-badge-neutral"
    }
  }

  return (
    <div className="p-6">
      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {providers.map((provider) => (
          <Card
            key={provider.id}
            className={`cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 ${
              selectedProvider.id === provider.id
                ? "ring-2 ring-theme-primary ring-offset-2 dark:ring-offset-slate-900"
                : ""
            }`}
            onClick={() => setSelectedProvider(provider)}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={provider.avatar || "/placeholder.svg"} alt={provider.name} />
                  <AvatarFallback>{provider.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{provider.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {provider.role} • {provider.specialty}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{provider.appointments}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{provider.completed}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Done</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {provider.inProgress + provider.scheduled}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Provider Appointments */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {selectedProvider.name}'s Appointments
          </h2>
          <Button className="theme-button text-white">View Schedule</Button>
        </div>
        <div className="overflow-x-auto">
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
              {providerAppointments.map((appointment) => (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
