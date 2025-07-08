import PatientDashboard from "@/components/patients/patient-dashboard";
import { getClientId } from "@/utils/serverCookie";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

export default function page( request: NextRequest) {
  const clientId = getClientId(request); 

  if(!clientId) {
    redirect("/login");
  }

  return (
    <PatientDashboard />
  )
}