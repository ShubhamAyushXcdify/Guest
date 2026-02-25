//  import MyPetsPage from "@/components/patientDashboard/mypets";
import dynamic from "next/dynamic";
import { Suspense } from "react";
 
const MyPetsPage = dynamic(() => import("@/components/patientDashboard/mypets"))
 
 
export default function MyPets() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPetsPage />
    </Suspense>
  )
}