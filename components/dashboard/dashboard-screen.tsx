"use client"

import { useState, useEffect } from "react"
import { NewPatientModal } from "@/components/new-patient-modal"
import { NewAppointmentDrawer } from "@/components/new-appointment-drawer"
import { NewInvoiceDrawer } from "@/components/new-invoice-drawer"
import { DashboardWelcomeHeader } from "./dashboard-welcome-header"
import { DashboardActionButtons } from "./dashboard-action-buttons"
import { DashboardStatsCards } from "./dashboard-stats-cards"
import { DashboardScheduleTable } from "./dashboard-schedule-table"

export const DashboardScreen = () => {
  const [mounted, setMounted] = useState(false)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showNewAppointmentDrawer, setShowNewAppointmentDrawer] = useState(false)
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)

  // Ensure we only access browser APIs on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  return (
    <>
      <div className="p-6">
        <DashboardWelcomeHeader />
        
        <DashboardActionButtons 
          onNewPatient={() => setShowNewPatientModal(true)}
          onNewAppointment={() => setShowNewAppointmentDrawer(true)}
          onNewInvoice={() => setShowNewInvoiceDrawer(true)}
        />
        
        <DashboardStatsCards />
        
        <DashboardScheduleTable />
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