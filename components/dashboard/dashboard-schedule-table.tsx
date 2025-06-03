"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const DashboardScheduleTable = () => {
  const [appointments] = useState([
    {
      time: "8:30 AM",
      patient: "Bella (Cat)",
      reason: "Vaccination",
      status: "In Room",
    },
    {
      time: "9:15 AM",
      patient: "Max (Dog)",
      reason: "Check-up",
      status: "Completed",
    },
    {
      time: "10:00 AM",
      patient: "Charlie (Dog)",
      reason: "Dental",
      status: "Completed",
    },
    {
      time: "11:30 AM",
      patient: "Daisy (Rabbit)",
      reason: "Nail Trim",
      status: "Completed",
    },
    {
      time: "1:00 PM",
      patient: "Oscar (Cat)",
      reason: "Surgery",
      status: "In Progress",
    },
    {
      time: "2:30 PM",
      patient: "Rocky (Dog)",
      reason: "Wound Check",
      status: "Scheduled",
    },
    {
      time: "3:15 PM",
      patient: "Luna (Cat)",
      reason: "Check-up",
      status: "Scheduled",
    },
    {
      time: "4:00 PM",
      patient: "Cooper (Dog)",
      reason: "Allergy Consult",
      status: "Scheduled",
    },
  ])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
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
                Reason
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {appointments.map((appointment, index) => (
              <tr key={index} className="dark:hover:bg-slate-750">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {appointment.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.patient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {appointment.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={
                      appointment.status === "In Room"
                        ? "theme-badge-info"
                        : appointment.status === "Completed"
                          ? "theme-badge-success"
                          : appointment.status === "In Progress"
                            ? "theme-badge-warning"
                            : "theme-badge-neutral"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700">
        <Button variant="outline" className="theme-button-outline">
          View Full Schedule
        </Button>
      </div>
    </div>
  )
} 