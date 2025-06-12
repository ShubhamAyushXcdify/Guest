"use client"

import { Card, CardContent } from "@/components/ui/card"

interface VitalsTabProps {
  patientId: string
  appointmentId: string
}

export default function VitalsTab({ patientId, appointmentId }: VitalsTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Vitals</h2>
        <p>Patient vitals information will go here.</p>
      </CardContent>
    </Card>
  )
} 