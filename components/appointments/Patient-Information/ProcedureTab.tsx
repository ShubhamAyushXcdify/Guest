"use client"

import { Card, CardContent } from "@/components/ui/card"

interface ProcedureTabProps {
  patientId: string
  appointmentId: string
}

export default function ProcedureTab({ patientId, appointmentId }: ProcedureTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Procedure</h2>
        <p>Procedure information will go here.</p>
      </CardContent>
    </Card>
  )
} 