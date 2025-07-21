"use client"

import { useState } from "react"
import VaccinationPlanning from "./VaccinationPlanning"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"

interface VaccinationManagerProps {
  patientId: string
  appointmentId: string
  onClose: () => void
}

export default function VaccinationManager({ 
  patientId,
  appointmentId,
  onClose
}: VaccinationManagerProps) {
  const { data: appointment } = useGetAppointmentById(appointmentId)
  
  // Get patient species from appointment data
  const species = appointment?.patient?.species || "dog"

  return (
    <VaccinationPlanning
      patientId={patientId}
      appointmentId={appointmentId}
      species={species}
      clinicId={appointment?.clinicId}
      onNext={() => {}}
      onClose={onClose}
    />
  )
} 