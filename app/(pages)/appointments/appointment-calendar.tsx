"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function AppointmentCalendar() {
  const [viewMode, setViewMode] = useState("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      patient: "Max (Dog)",
      type: "Vaccination",
      day: "Mon",
      date: 12,
      time: "8:00",
      duration: 60,
      color: "blue",
    },
    {
      id: 2,
      patient: "Bella (Cat)",
      type: "Surgery",
      day: "Mon",
      date: 12,
      time: "10:00",
      duration: 120,
      color: "red",
    },
    {
      id: 3,
      patient: "Rocky (Dog)",
      type: "Check-up",
      day: "Tue",
      date: 13,
      time: "9:00",
      duration: 60,
      color: "blue",
    },
    {
      id: 4,
      patient: "Lucy (Dog)",
      type: "Vaccination",
      day: "Wed",
      date: 14,
      time: "11:00",
      duration: 60,
      color: "green",
    },
    {
      id: 5,
      patient: "Oscar (Cat)",
      type: "Dental Procedure",
      day: "Thu",
      date: 15,
      time: "13:00",
      duration: 120,
      color: "red",
    },
    {
      id: 6,
      patient: "Cooper (Dog)",
      type: "Check-up",
      day: "Fri",
      date: 16,
      time: "9:00",
      duration: 60,
      color: "blue",
    },
    {
      id: 7,
      patient: "Charlie (Bird)",
      type: "Consultation",
      day: "Tue",
      date: 13,
      time: "13:00",
      duration: 60,
      color: "amber",
    },
    {
      id: 8,
      patient: "Daisy (Rabbit)",
      type: "Check-up",
      day: "Thu",
      date: 15,
      time: "15:00",
      duration: 60,
      color: "blue",
    },
    {
      id: 9,
      patient: "Lily (Cat)",
      type: "Grooming",
      day: "Fri",
      date: 16,
      time: "14:00",
      duration: 60,
      color: "purple",
    },
  ]

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const hours = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

  const getAppointmentsByDay = (day: string) => {
    return appointments.filter((appointment) => appointment.day === day)
  }

  const getAppointmentsByHour = (day: string, hour: string) => {
    return appointments.filter((appointment) => appointment.day === day && appointment.time === hour)
  }

  const getAppointmentStyle = (type: string) => {
    switch (type) {
      case "Check-up":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
      case "Surgery":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
      case "Consultation":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
      case "Grooming":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
      case "Vaccination":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
      case "Dental Procedure":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  return (
    <div className="p-6">
      {/* Calendar Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={viewMode === "day" ? "theme-button text-white" : ""}
            onClick={() => setViewMode("day")}
          >
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={viewMode === "week" ? "theme-button text-white" : ""}
            onClick={() => setViewMode("week")}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={viewMode === "month" ? "theme-button text-white" : ""}
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-l-md rounded-r-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 py-2 border-t border-b border-gray-200 dark:border-gray-700">
              May 12 - May 18, 2025
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-r-md rounded-l-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            Provider: All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            Room: All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            Type: All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Week View Calendar */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          <div className="p-2 border-r border-gray-200 dark:border-gray-700"></div>
          {days.map((day, index) => (
            <div
              key={day}
              className="p-2 text-center font-medium border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day} {12 + index}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-7">
              <div className="p-2 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {hour}
              </div>
              {days.map((day) => {
                const appts = getAppointmentsByHour(day, hour)
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="p-1 min-h-[60px] border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative"
                  >
                    {appts.map((appt) => (
                      <div
                        key={appt.id}
                        className={`p-1 text-xs rounded border mb-1 cursor-pointer ${getAppointmentStyle(appt.type)}`}
                      >
                        <div className="font-medium">{appt.patient}</div>
                        <div>{appt.type}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Legend */}
      <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-sm">Check-up</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-sm">Surgery</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
          <span className="text-sm">Consultation</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
          <span className="text-sm">Grooming</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm">Vaccination</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
          <span className="text-sm">Blocked Time</span>
        </div>
      </div>
    </div>
  )
}
