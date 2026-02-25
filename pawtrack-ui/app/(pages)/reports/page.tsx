import { redirect } from "next/navigation"

export default function ReportsPage() {
  // Redirect to the dashboard by default
  redirect("/reports/dashboard")
}
