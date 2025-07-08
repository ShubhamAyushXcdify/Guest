import PatientDashboard from "@/components/patients/patient-dashboard";
import { getClientId } from "@/utils/serverCookie";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export default function page( request: NextRequest) {
  const clientId = getClientId(request); 

  if(!clientId) {
    redirect("/login");
  }

  return (
    <PatientDashboard />
  )
}