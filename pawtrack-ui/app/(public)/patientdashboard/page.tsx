import { redirect } from "next/navigation";

export default function Page() {
  redirect("/patientdashboard/overview");
  return null;
}