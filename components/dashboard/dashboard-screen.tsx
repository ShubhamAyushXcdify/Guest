"use client"

import { useState, useEffect } from "react"
import { NewPatientModal } from "@/components/new-patient-modal"
import { NewAppointmentDrawer } from "@/components/new-appointment-drawer"
import { NewInvoiceDrawer } from "@/components/new-invoice-drawer"
import { useRootContext } from "@/context/RootContext"

// Import role-specific dashboards
import AdminDashboardWrapper from "./roles/admin"
import ClinicAdminDashboardWrapper from "./roles/clinic-admin"
import ClinicStaffDashboardWrapper from "./roles/clinic-staff"
import ClientDashboardWrapper from "./roles/client"

export const DashboardScreen = () => {
  const [mounted, setMounted] = useState(false)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showNewAppointmentDrawer, setShowNewAppointmentDrawer] = useState(false)
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)
  const [editAppointmentId, setEditAppointmentId] = useState<string | null>(null);

  const { IsAdmin, userType } = useRootContext();

  // Listen for appointment approval events
  useEffect(() => {
    const handleApproveAppointment = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.appointmentId) {
        setEditAppointmentId(customEvent.detail.appointmentId);
    setShowNewAppointmentDrawer(true);
      }
    };

    window.addEventListener('approveAppointment', handleApproveAppointment as EventListener);
    return () => {
      window.removeEventListener('approveAppointment', handleApproveAppointment as EventListener);
    };
  }, []);

  // Ensure we only access browser APIs on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  // Render different dashboards based on user role
  const renderDashboardByRole = () => {
    if (IsAdmin) {
      return (
        <AdminDashboardWrapper />
      );
    } else if (userType.isClinicAdmin) {
      return (
        <ClinicAdminDashboardWrapper 
          onNewPatient={() => setShowNewPatientModal(true)}
          onNewAppointment={() => setShowNewAppointmentDrawer(true)}
        />
      );
    } else if (userType.isProvider || userType.isReceptionist) {
  return (
        <ClinicStaffDashboardWrapper 
            onNewPatient={() => setShowNewPatientModal(true)}
            onNewAppointment={() => setShowNewAppointmentDrawer(true)}
            onNewInvoice={() => setShowNewInvoiceDrawer(true)}
          editAppointmentId={editAppointmentId}
          setEditAppointmentId={setEditAppointmentId}
        />
      );
    } else if (userType.isClient) {
      return (
        <ClientDashboardWrapper 
          onNewAppointment={() => setShowNewAppointmentDrawer(true)} 
        />
      );
    } else {
      // Default dashboard or not authorized message
      return (
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Welcome to PawTrack</h1>
          <p className="mt-4">Your dashboard is not configured yet. Please contact support.</p>
        </div>
      );
    }
  };
              
              return (
    <>
      {renderDashboardByRole()}

      {/* Modals and Drawers (keep these outside the conditional so they work for all roles) */}
      <NewPatientModal isOpen={showNewPatientModal} onClose={() => setShowNewPatientModal(false)} />
      <NewAppointmentDrawer 
        isOpen={showNewAppointmentDrawer} 
        onClose={() => {
          setShowNewAppointmentDrawer(false);
          setEditAppointmentId(null);
        }} 
        appointmentId={editAppointmentId}
        sendEmail={!!editAppointmentId} // Send email when editing an appointment from requests
      />
      <NewInvoiceDrawer isOpen={showNewInvoiceDrawer} onClose={() => setShowNewInvoiceDrawer(false)} />
    </>
  )
}