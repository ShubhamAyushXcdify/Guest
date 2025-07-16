"use client"

import { useState } from "react"
import VaccinationPlanning from "./VaccinationPlanning"
import VaccinationRecord from "./VaccinationRecord"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useCreateVaccinationDetail } from "@/queries/vaccinationDetail/create-vaccinationDetail"

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
  // Update the currentStep state to always start with "planning"
  const [currentStep, setCurrentStep] = useState<"planning" | "record">("planning");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([])
  const { data: appointment } = useGetAppointmentById(appointmentId)
  
  // Get patient species from appointment data
  const species = appointment?.patient?.species || "dog"

  // Handle moving from planning to record step
  const handleNext = (vaccines: string[]) => {
    setSelectedVaccines(vaccines)
    setCurrentStep("record")
  }

  // Handle going back to planning step
  const handleBack = () => {
    setCurrentStep("planning")
  }

  // Handle final submission of vaccination records
  const handleRecordSubmit = (success: boolean) => {
    if (success) {
      // Close the drawer on success
      onClose();
    }
  }

  return (
    <>
      {currentStep === "planning" ? (
        <VaccinationPlanning
          patientId={patientId}
          appointmentId={appointmentId}
          species={species}
          onNext={handleNext}
          onClose={onClose}
        />
      ) : (
        <VaccinationRecord 
          patientId={patientId} 
          appointmentId={appointmentId} 
          species={species}
          selectedVaccines={selectedVaccines}
          onBack={handleBack}
          onSubmit={handleRecordSubmit}
        />
      )}
    </>
  )
} 