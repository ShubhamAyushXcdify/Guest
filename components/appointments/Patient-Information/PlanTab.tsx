"use client"

import { Card, CardContent } from "@/components/ui/card"

interface PlanTabProps {
  patientId: string
  appointmentId: string
  onNext?: () => void
}

export default function PlanTab({ patientId, appointmentId, onNext }: PlanTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Plan</h2>
        <p>Treatment plan information will go here.</p>
      </CardContent>
    </Card>
  )
} 