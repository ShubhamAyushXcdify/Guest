import AppointmentsPage from "@/components/appointments";
import { Suspense } from "react";


export default function Appointments() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppointmentsPage />
    </Suspense>
  )
}