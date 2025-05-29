"use client"

import { Button } from "@/components/ui/button"

interface DashboardActionButtonsProps {
  onNewPatient: () => void
  onNewAppointment: () => void
  onNewInvoice: () => void
}

export const DashboardActionButtons = ({
  onNewPatient,
  onNewAppointment,
  onNewInvoice
}: DashboardActionButtonsProps) => {
  return (
    <div className="flex justify-end gap-3 mb-6">
      <Button className="theme-button text-white" onClick={onNewPatient}>
        New Patient
      </Button>
      <Button className="theme-button text-white" onClick={onNewAppointment}>
        New Appointment
      </Button>
      <Button className="theme-button text-white" onClick={onNewInvoice}>
        New Invoice
      </Button>
    </div>
  )
} 