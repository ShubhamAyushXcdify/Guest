"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewPatientModal } from "@/components/new-patient-modal"
import { NewAppointmentDrawer } from "@/components/new-appointment-drawer"
import { NewInvoiceDrawer } from "@/components/new-invoice-drawer"

export default function Dashboard() {
  const today = new Date()
  // Use native JavaScript Date methods instead of date-fns
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const [mounted, setMounted] = useState(false)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showNewAppointmentDrawer, setShowNewAppointmentDrawer] = useState(false)
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)

  // Ensure we only access browser APIs on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

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

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, Dr. Smith</h1>
          <p className="text-gray-600 dark:text-gray-400">{formattedDate}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-6">
          <Button className="theme-button text-white" onClick={() => setShowNewPatientModal(true)}>
            New Patient
          </Button>
          <Button className="theme-button text-white" onClick={() => setShowNewAppointmentDrawer(true)}>
            New Appointment
          </Button>
          <Button className="theme-button text-white" onClick={() => setShowNewInvoiceDrawer(true)}>
            New Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold theme-text-primary">12</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">4 Completed</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold theme-text-secondary">8</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">prescriptions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold theme-text-accent">5</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">3 clients, 2 staff</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold theme-text-primary">$1,250</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">7 invoices</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Table */}
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
      </div>

      {/* New Patient Modal */}
      <NewPatientModal isOpen={showNewPatientModal} onClose={() => setShowNewPatientModal(false)} />

      {/* New Appointment Drawer */}
      <NewAppointmentDrawer isOpen={showNewAppointmentDrawer} onClose={() => setShowNewAppointmentDrawer(false)} />

      {/* New Invoice Drawer */}
      <NewInvoiceDrawer isOpen={showNewInvoiceDrawer} onClose={() => setShowNewInvoiceDrawer(false)} />
    </>
  )
}
