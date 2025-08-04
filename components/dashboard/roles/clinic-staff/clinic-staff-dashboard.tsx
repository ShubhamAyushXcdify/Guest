"use client"

import { useState, useEffect } from "react"
import { DashboardWelcomeHeader } from "../../shared/dashboard-welcome-header"
import { DashboardActionButtons } from "../../shared/dashboard-action-buttons"
import { DashboardStatsCards } from "../../shared/dashboard-stats-cards"
import { DashboardScheduleTable } from "../../shared/dashboard-schedule-table"
import { useGetAppointments } from "@/queries/appointment/get-appointment"
import { useRootContext } from "@/context/RootContext"

export const ClinicStaffDashboard = ({
  onNewPatient,
  onNewAppointment,
  onNewInvoice,
  onAddProduct,
  onAddSupplier,
  onAddClient,
  onCreatePurchaseOrder,
  editAppointmentId,
  setEditAppointmentId
}: {
  onNewPatient: () => void
  onNewAppointment: () => void
  onNewInvoice: () => void
  onAddProduct?: () => void
  onAddSupplier?: () => void
  onAddClient?: () => void
  onCreatePurchaseOrder?: () => void
  editAppointmentId: string | null
  setEditAppointmentId: (id: string | null) => void
}) => {
  const today = new Date();

  const startOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Convert local time to UTC ISO string
  const startOfDay = new Date(startOfDayLocal.getTime() - startOfDayLocal.getTimezoneOffset() * 60000);
  const endOfDay = new Date(endOfDayLocal.getTime() - endOfDayLocal.getTimezoneOffset() * 60000);

  const { clinic } = useRootContext();
  
  // Update searchParams to use dateRange
  const searchParams = {
    search: null,
    status: null,
    provider: null,
    dateFrom: startOfDay.toISOString(),
    dateTo: endOfDay.toISOString(),
    clinicId: clinic?.id ?? null,
    patientId: null,
    clientId: null,
    veterinarianId: null,
    roomId: null,
    pageNumber: 1,
    pageSize: 10,
    isRegistered: false
  };

  const { data: appointmentsData } = useGetAppointments(searchParams);

  // Request appointments search params
  const requestAppointmentsParams = {
    search: null,
    status: null,
    provider: null,
    dateFrom: null,
    dateTo: null,
    clinicId: clinic?.id ?? null,
    patientId: null,
    clientId: null,
    veterinarianId: null,
    roomId: null,
    pageNumber: 1,
    pageSize: 5,
    isRegistered: true
  };

  // Fetch appointment requests
  const { data: appointmentRequestsData } = useGetAppointments(requestAppointmentsParams);

  // Handle appointment approval
  const handleApproveAppointment = (appointmentId: string) => {
    setEditAppointmentId(appointmentId);
    onNewAppointment();
  };

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
  // Check if appointmentsData has items property (paginated response) or is an array
  const appointmentsItems = appointmentsData?.items || appointmentsData || [];
  
  const todaysAppointments = Array.isArray(appointmentsItems) 
    ? appointmentsItems.filter((a: any) => isToday(a.appointmentDate))
    : [];

  const todayAppointmentsCount = todaysAppointments.length;
  const todayCompletedCount = todaysAppointments.filter((a: any) => a.status === "completed").length;
  
  // Get appointment requests
  const appointmentRequests = appointmentRequestsData?.items || [];

  return (
    <div className="p-6">
      <DashboardActionButtons 
        onNewPatient={onNewPatient}
        onNewAppointment={onNewAppointment}
        onNewInvoice={onNewInvoice}
        onAddProduct={onAddProduct}
        onAddSupplier={onAddSupplier}
        onAddClient={onAddClient}
        onCreatePurchaseOrder={onCreatePurchaseOrder}
      />
      <DashboardStatsCards 
        todayAppointmentsCount={todayAppointmentsCount}
        todayCompletedCount={todayCompletedCount}
      />
      <DashboardScheduleTable 
        appointments={todaysAppointments}
        pendingRegistrations={appointmentRequests}
      />
    </div>
  )
} 