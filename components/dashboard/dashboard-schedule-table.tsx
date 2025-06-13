"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  startTime?: string;
  patient?: { name?: string; species?: string } | string;
  reason?: string;
  status?: string;
}

interface DashboardScheduleTableProps {
  appointments: Appointment[];
}

export const DashboardScheduleTable = ({ appointments }: DashboardScheduleTableProps) => {
  // Helper to format time from 'HH:mm:ss' to 'h:mm A'
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
                {formatTime(appointment.startTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {typeof appointment.patient === 'string'
                    ? appointment.patient
                    : `${appointment.patient?.name || ''}${appointment.patient?.species ? ` (${appointment.patient.species})` : ''}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                   {appointment.reason || ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={
                      appointment.status === "in_progress"
                        ? "theme-badge-info"
                        : appointment.status === "completed"
                        ? "theme-badge-success"
                        : appointment.status === "in_room"
                        ? "theme-badge-warning"
                        : appointment.status === "scheduled"
                        ? "theme-badge-neutral"
                        : appointment.status === "cancelled"
                        ? "theme-badge-destructive"
                        : "theme-badge-neutral"
                    }
                  >
                     {appointment.status ? appointment.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''}
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