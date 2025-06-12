"use client"

import { Card, CardContent } from "@/components/ui/card"

interface AssessmentTabProps {
  patientId: string
  appointmentId: string
}

export default function AssessmentTab({ patientId, appointmentId }: AssessmentTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Assessment</h2>
        <p>Patient assessment information will go here.</p>
      </CardContent>
    </Card>
  )
} 