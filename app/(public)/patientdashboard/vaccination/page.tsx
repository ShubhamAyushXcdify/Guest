
import VaccinationPage from "@/components/patientDashboard/vaccination";
import { Suspense } from "react";

export default function Vaccination() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VaccinationPage />
    </Suspense>
  );
}
