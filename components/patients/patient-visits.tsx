"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function PatientVisits() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const upcomingAppointments = [
    {
      id: 1,
      date: "May 15, 2025",
      time: "2:00 PM",
      type: "Dental Cleaning",
      vet: "Dr. Sarah Johnson",
      status: "scheduled",
    },
    {
      id: 2,
      date: "Aug 20, 2025",
      time: "10:30 AM",
      type: "Annual Check-up",
      vet: "Dr. Michael Chen",
      status: "scheduled",
    },
  ]

  const pastAppointments = [
    {
      id: 3,
      date: "May 1, 2025",
      time: "1:30 PM",
      type: "Annual Check-up",
      vet: "Dr. Sarah Johnson",
      notes: "Healthy overall. Weight stable. Mild tartar buildup recommended for dental cleaning.",
    },
    {
      id: 4,
      date: "Mar 15, 2025",
      time: "11:00 AM",
      type: "Vaccination",
      vet: "Dr. Michael Chen",
      notes: "Rabies and DHPP vaccines administered. No adverse reactions.",
    },
    {
      id: 5,
      date: "Nov 10, 2024",
      time: "3:30 PM",
      type: "Sick Visit - Digestive Issues",
      vet: "Dr. Sarah Johnson",
      notes: "Mild gastrointestinal upset. Prescribed probiotics and special diet for 3 days.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Appointment Calendar */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Calendar</h3>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center justify-center gap-1 h-9 px-4">
                    <CalendarIcon className="h-4 w-4" />
                    {date ? format(date, "MMMM yyyy") : "Select Month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-6 py-8">
            {/* Calendar preview would go here */}
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-12 w-12 mb-2" />
              <p className="text-sm">Calendar view would be displayed here</p>
              <p className="text-xs mt-1">Showing appointments for {format(date || new Date(), "MMMM yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visits & Appointments</h3>
            <Button className="theme-button text-white">
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <div className="px-4 pt-4">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Visits</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Vet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {upcomingAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{appointment.date}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {appointment.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {appointment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {appointment.vet}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            Scheduled
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="past" className="p-0 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Vet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {pastAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{appointment.date}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {appointment.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {appointment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {appointment.vet}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200 max-w-md">
                          {appointment.notes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button variant="secondary" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 