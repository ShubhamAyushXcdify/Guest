"use client"

import { ClinicStaffDashboard } from "./clinic-staff-dashboard"

export default function ClinicStaffDashboardWrapper({
  onNewPatient,
  onNewAppointment,
  onNewInvoice,
  editAppointmentId,
  setEditAppointmentId
}: {
  onNewPatient: () => void
  onNewAppointment: () => void
  onNewInvoice: () => void
  editAppointmentId: string | null
  setEditAppointmentId: (id: string | null) => void
}) {
  return (
    <ClinicStaffDashboard 
      onNewPatient={onNewPatient}
      onNewAppointment={onNewAppointment}
      onNewInvoice={onNewInvoice}
      editAppointmentId={editAppointmentId}
      setEditAppointmentId={setEditAppointmentId}
    />
  )
}

export { ClinicStaffDashboard } 