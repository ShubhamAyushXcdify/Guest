import PatientDashboard from "@/components/patients/patient-dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("clientId")?.value;  

  if (!clientId) {
    redirect("/login");
  }

  return (
    <PatientDashboard />
  )
}