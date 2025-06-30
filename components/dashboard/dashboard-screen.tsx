"use client"

import { useState, useEffect, useMemo } from "react"
import { NewPatientModal } from "@/components/new-patient-modal"
import { NewAppointmentDrawer } from "@/components/new-appointment-drawer"
import { NewInvoiceDrawer } from "@/components/new-invoice-drawer"
import { DashboardWelcomeHeader } from "./dashboard-welcome-header"
import { DashboardActionButtons } from "./dashboard-action-buttons"
import { DashboardStatsCards } from "./dashboard-stats-cards"
import { DashboardScheduleTable } from "./dashboard-schedule-table"
import { useGetAppointments } from "@/queries/appointment/get-appointment"
import { useGetDashboardSummary } from "@/queries/dashboard/get-dashboard-summary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { TrendingUp } from "lucide-react"
import { useRootContext } from "@/context/RootContext"

export const DashboardScreen = () => {
  const [mounted, setMounted] = useState(false)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showNewAppointmentDrawer, setShowNewAppointmentDrawer] = useState(false)
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)

  const today = new Date();

  const startOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Convert local time to UTC ISO string
  const startOfDay = new Date(startOfDayLocal.getTime() - startOfDayLocal.getTimezoneOffset() * 60000);
  const endOfDay = new Date(endOfDayLocal.getTime() - endOfDayLocal.getTimezoneOffset() * 60000);

  const searchParams = useMemo(() => ({
    search: null,
    status: null,
    provider: null,
    dateFrom: startOfDay.toISOString(),
    dateTo: endOfDay.toISOString(),
    clinicId: null,
    patientId: null,
    clientId: null,
    veterinarianId: null,
    roomId: null,
    pageNumber: 1,
    pageSize: 10,
  }), [startOfDay, endOfDay]);

  const { data: appointmentsData } = useGetAppointments(searchParams);

  const { data: dashboardSummaryData, isLoading, error } = useGetDashboardSummary();

  const { IsAdmin } = useRootContext();

  // Helper to check if a date is today
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Filter only today's appointments
  // Check if appointmentsData has items property (paginated response) or is an array
  const appointmentsItems = appointmentsData?.items || appointmentsData || [];
  
  const todaysAppointments = Array.isArray(appointmentsItems) 
    ? appointmentsItems.filter((a: any) => isToday(a.appointmentDate))
    : [];

  const todayAppointmentsCount = todaysAppointments.length;
  const todayCompletedCount = todaysAppointments.filter((a: any) => a.status === "completed").length;

  // Ensure we only access browser APIs on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading dashboard summary</div>;


  const clinics = dashboardSummaryData?.data?.clinics || [];

  return (
    <>
      {/* Non-admin section */}
      {!IsAdmin && (
        <div className="p-6">
          <DashboardWelcomeHeader date={today} />
          <DashboardActionButtons 
            onNewPatient={() => setShowNewPatientModal(true)}
            onNewAppointment={() => setShowNewAppointmentDrawer(true)}
            onNewInvoice={() => setShowNewInvoiceDrawer(true)}
          />
          <DashboardStatsCards 
            todayAppointmentsCount={todayAppointmentsCount}
            todayCompletedCount={todayCompletedCount}
          />
          <DashboardScheduleTable 
            appointments={todaysAppointments}
          />
        </div>
      )}

      {/* Admin-only section */}
      {IsAdmin && (
        <div className="p-6 grid gap-8">
          {clinics.map((clinic: any, idx: number) => {
            const details = clinic.clinicDetails || {};
            const ratios = clinic.appointmentCompletionRatios || {};
            const pieData = [
              { name: "Completed", value: ratios.completedAppointments || 0, fill: "var(--chart-1)" },
              { name: "Canceled", value: ratios.canceledAppointments || 0, fill: "var(--chart-2)" },
              { name: "Other", value: (ratios.totalAppointments || 0) - (ratios.completedAppointments || 0) - (ratios.canceledAppointments || 0), fill: "var(--chart-3)" },
            ];
            return (
              <Card key={idx} className="w-full max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>{clinic.clinicName}</CardTitle>
                  <CardDescription>Clinic Overview</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Veterinarians</div>
                        <div className="text-2xl font-bold">{details.numberOfVeterinarians}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Patients</div>
                        <div className="text-2xl font-bold">{details.numberOfPatients}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Clients</div>
                        <div className="text-2xl font-bold">{details.numberOfClients}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Products</div>
                        <div className="text-2xl font-bold">{details.numberOfProducts}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Suppliers</div>
                        <div className="text-2xl font-bold">{details.numberOfSuppliers}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <ChartContainer
                      config={{
                        completed: { label: "Completed", color: "var(--chart-1)" },
                        canceled: { label: "Canceled", color: "var(--chart-2)" },
                        other: { label: "Other", color: "var(--chart-3)" },
                      }}
                      className="mx-auto aspect-square max-h-[250px]"
                    >
                      <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={pieData} dataKey="value" nameKey="name" label />
                      </PieChart>
                    </ChartContainer>
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                      Total Appointments: <span className="font-medium">{ratios.totalAppointments}</span><br />
                      Completion Ratio: <span className="font-medium">{ratios.completionRatio}</span> ({ratios.percentageOfCompleting})
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Showing summary for this clinic
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals and Drawers (keep these outside the conditional so they work for both) */}
      <NewPatientModal isOpen={showNewPatientModal} onClose={() => setShowNewPatientModal(false)} />
      <NewAppointmentDrawer isOpen={showNewAppointmentDrawer} onClose={() => setShowNewAppointmentDrawer(false)} />
      <NewInvoiceDrawer isOpen={showNewInvoiceDrawer} onClose={() => setShowNewInvoiceDrawer(false)} />
    </>
  )
} 