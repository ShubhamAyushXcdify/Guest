"use client"

import { useState, useEffect, useMemo } from "react"
import { NewPatientModal } from "@/components/new-patient-modal"
import { NewAppointmentDrawer } from "@/components/new-appointment-drawer"
import { NewInvoiceDrawer } from "@/components/new-invoice-drawer"
import { DashboardWelcomeHeader } from "./dashboard-welcome-header"
import { DashboardActionButtons } from "./dashboard-action-buttons"
import { DashboardStatsCards } from "./dashboard-stats-cards"
import { DashboardScheduleTable } from "./dashboard-schedule-table"
import { useGetAppointments } from "@/queries/appointment/get-appointment"

export const DashboardScreen = () => {
  const [mounted, setMounted] = useState(false)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showNewAppointmentDrawer, setShowNewAppointmentDrawer] = useState(false)
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)

  const today = new Date();

  const startOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Convert local time to UTC ISO string
  const startOfDay = new Date(startOfDayLocal.getTime() - startOfDayLocal.getTimezoneOffset() * 60000);
  const endOfDay = new Date(endOfDayLocal.getTime() - endOfDayLocal.getTimezoneOffset() * 60000);

  const searchParams = useMemo(() => ({
    search: null,
    status: null,
    provider: null,
    dateFrom: startOfDay.toISOString(),
    dateTo: endOfDay.toISOString(),
  }), [startOfDay, endOfDay]);

  const { data: appointmentsData } = useGetAppointments(searchParams);

  // Helper to check if a date is today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Filter only today's appointments
  const todaysAppointments = (appointmentsData || []).filter(
    (a: any) => isToday(a.appointmentDate)
  );

  const todayAppointmentsCount = todaysAppointments.length;
  const todayCompletedCount = todaysAppointments.filter((a: any) => a.status === "completed").length;

  // Ensure we only access browser APIs on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  return (
    <>
      <div className="p-6">
          <DashboardWelcomeHeader date={today} />
        
        <DashboardActionButtons 
          onNewPatient={() => setShowNewPatientModal(true)}
          onNewAppointment={() => setShowNewAppointmentDrawer(true)}
          onNewInvoice={() => setShowNewInvoiceDrawer(true)}
        />
        
        <DashboardStatsCards 
          todayAppointmentsCount={todayAppointmentsCount}
          todayCompletedCount={todayCompletedCount}
        />
        
        <DashboardScheduleTable 
          appointments={todaysAppointments}
        />
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