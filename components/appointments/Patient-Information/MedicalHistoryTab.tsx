"use client"

import { Card, CardContent } from "@/components/ui/card"

interface MedicalHistoryTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function MedicalHistoryTab({ patientId, appointmentId, onNext }: MedicalHistoryTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Medical History</h2>
        <p>Patient medical history will go here.</p>
      </CardContent>
    </Card>
  )
} 