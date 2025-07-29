import MyPetsPage from "@/components/patientDashboard/mypets";
import { Suspense } from "react";

export default function MyPets() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPetsPage />
    </Suspense>
  )
}