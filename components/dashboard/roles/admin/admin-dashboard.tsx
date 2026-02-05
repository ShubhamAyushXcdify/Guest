"use client"

import { useState, useMemo } from "react"
import { useGetDashboardSummary } from "@/queries/dashboard/get-dashboard-summary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, Users, Stethoscope, Package, Truck, Building2 } from "lucide-react"
import { DatePickerWithRangeV2 } from "@/components/ui/custom/date/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetAppointments } from "@/queries/appointment/get-appointment"
import { useRootContext } from "@/context/RootContext"
import Loader from "@/components/ui/loader"

export const AdminDashboard = () => {
  const today = new Date();
  const { clinic } = useRootContext();

  const startOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Convert local time to UTC ISO string
  const startOfDay = new Date(startOfDayLocal.getTime() - startOfDayLocal.getTimezoneOffset() * 60000);
  const endOfDay = new Date(endOfDayLocal.getTime() - endOfDayLocal.getTimezoneOffset() * 60000);

  // Date range state for admin dashboard
  // Update this part in your component
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,  // This will set the default "from" date to today
    to: today     // This will set the default "to" date to today
  });

  // Request appointments search params
  const requestAppointmentsParams = useMemo(() => ({
    search: null,
    status: null,
    provider: null,
    dateFrom: null,
    dateTo: null,
    clinicId: null,
    patientId: null,
    clientId: null,
    veterinarianId: null,
    roomId: null,
    companyId: clinic?.companyId || null,
    appointmentId: null,
    tab: "admin-dashboard",
    pageNumber: 1,
    pageSize: 5,
    isRegistered: true,
  }), [clinic?.companyId]);


  // Fetch appointment requests
  const { data: appointmentRequestsData } = useGetAppointments(requestAppointmentsParams);

  // Handle appointment approval
  const handleApproveAppointment = (appointmentId: string) => {
    // Pass this up to the parent component to handle
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('approveAppointment', { detail: { appointmentId } });
      window.dispatchEvent(event);
    }
  };

  const dashboardSummaryParams = useMemo(() => {
    if (!clinic?.companyId) return null;  // Return null if no companyId

    const formatDate = (date: Date | undefined, fallback: Date) => {
      const d = date || fallback;
      return d.toISOString().split('T')[0];
    };

    return {
      companyId: clinic.companyId,  // We know this is defined here
      fromDate: formatDate(dateRange?.from, startOfDay),
      toDate: formatDate(dateRange?.to, endOfDay),
    };
  }, [clinic?.companyId, dateRange, startOfDay, endOfDay]);

  const { data: dashboardSummaryData, isLoading, error } = useGetDashboardSummary(
    dashboardSummaryParams,
    { enabled: !!dashboardSummaryParams?.companyId }
  );

  // Get appointment requests
  const appointmentRequests = appointmentRequestsData?.items || [];

  // Normalize API response: backend may return PascalCase (Clinics, ClinicDetails, etc.) or camelCase
  const rawData = dashboardSummaryData?.data;
  const rawClinics = rawData?.clinics ?? rawData?.Clinics ?? [];
  const clinics = rawClinics.map((c: any) => {
    const details = c.clinicDetails ?? c.ClinicDetails ?? {};
    const ratios = c.appointmentCompletionRatios ?? c.AppointmentCompletionRatios ?? {};
    return {
      clinicName: c.clinicName ?? c.ClinicName ?? "",
      clinicDetails: {
        numberOfVeterinarians: details.numberOfVeterinarians ?? details.NumberOfVeterinarians ?? 0,
        numberOfPatients: details.numberOfPatients ?? details.NumberOfPatients ?? 0,
        numberOfClients: details.numberOfClients ?? details.NumberOfClients ?? 0,
        numberOfProducts: details.numberOfProducts ?? details.NumberOfProducts ?? 0,
        numberOfSuppliers: details.numberOfSuppliers ?? details.NumberOfSuppliers ?? 0,
      },
      appointmentCompletionRatios: {
        totalAppointments: ratios.totalAppointments ?? ratios.TotalAppointments ?? 0,
        completedAppointments: ratios.completedAppointments ?? ratios.CompletedAppointments ?? 0,
        canceledAppointments: ratios.canceledAppointments ?? ratios.CanceledAppointments ?? 0,
        completionRatio: ratios.completionRatio ?? ratios.CompletionRatio ?? 0,
        percentageOfCompleting: ratios.percentageOfCompleting ?? ratios.PercentageOfCompleting ?? "0",
      },
      averageRating: c.averageRating ?? c.AverageRating ?? null,
      serviceProfit: c.serviceProfit ?? c.ServiceProfit ?? 0,
      productProfit: c.productProfit ?? c.ProductProfit ?? 0,
    };
  });

  if (!dashboardSummaryParams?.companyId) return <div className="p-6 text-muted-foreground">Select a company or clinic to view dashboard.</div>;
  if (isLoading) return <div className="min-h-svh flex items-center justify-center p-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <Loader size="lg" label="Loading..." />
    </div>
  </div>
  if (error) return <div className="p-6 text-red-500">Error loading dashboard summary</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-slate-50 to-[#D2EFEC] dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 -m-4 mb-4 rounded-b-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your clinic operations and statistics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DatePickerWithRangeV2
            date={dateRange}
            setDate={setDateRange}
            showYear={true}
          />
        </div>
      </div>

      {/* NEW LAYOUT: Summary Cards in Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Summary Cards - 50% width on desktop, 2 columns if appointment requests are present */}
        <div className={`grid ${appointmentRequests.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-4'} grid-cols-1 gap-6 flex-1 lg:w-1/2`}>
          <Card className="border bg-gradient-to-br from-[#D2EFEC] to-[#D2EFEC] dark:from-[#1E3D3D]/50 dark:to-[#1E3D3D]/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#D2EFEC] dark:bg-[#1E3D3D]/50">
                  <Building2 className="h-6 w-6 text-[#1E3D3D] dark:text-[#D2EFEC]" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Clinics</p>
                  <p className="text-2xl font-bold theme-text-primary">{clinics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-br from-[#D2EFEC] to-[#D2EFEC] dark:from-[#1E3D3D]/50 dark:to-[#1E3D3D]/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-[#D2EFEC] dark:bg-[#1E3D3D]/50">
                  <Stethoscope className="h-6 w-6 text-[#1E3D3D] dark:text-[#D2EFEC]" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Veterinarians</p>
                  <p className="text-2xl font-bold theme-text-secondary">
                    {clinics.reduce((sum: number, clinic: any) => sum + (clinic.clinicDetails?.numberOfVeterinarians || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-200 dark:bg-green-900/50">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {clinics.reduce((sum: number, c: any) => sum + (c.clinicDetails?.numberOfPatients || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-orange-200 dark:bg-orange-900/50">
                  <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {clinics.reduce((sum: number, c: any) => sum + (c.clinicDetails?.numberOfProducts || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Requests Card - 50% width on desktop */}
        {appointmentRequests.length > 0 && (
          <Card className="col-span-1 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 lg:w-1/2 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Appointment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '112px' }}>
                {appointmentRequests.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-base text-primary">{appointment.patient?.name || "Unknown"}</span>
                      <span className="text-sm text-muted-foreground">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveAppointment(appointment.id)} title="Approve">
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clinics accordion */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Clinics by location</h2>
        <Accordion
          type="multiple"
          defaultValue={clinics.length > 0 ? [String(0)] : []}
          className="w-full rounded-lg border border-border bg-card text-card-foreground shadow-sm"
        >
          {clinics.map((clinic: any, idx: number) => {
            const details = clinic.clinicDetails || {};
            const ratios = clinic.appointmentCompletionRatios || {};
            const pieData = [
              { name: "Completed", value: ratios.completedAppointments || 0, fill: "hsl(var(--chart-1))" },
              { name: "Canceled", value: ratios.canceledAppointments || 0, fill: "hsl(var(--destructive))" },
              { name: "Other", value: Math.max(0, (ratios.totalAppointments || 0) - (ratios.completedAppointments || 0) - (ratios.canceledAppointments || 0)), fill: "hsl(var(--muted))" },
            ].filter((d) => d.value > 0);
            const barData = [
              { metric: "Vets", count: details.numberOfVeterinarians || 0, fill: "var(--color-vets)" },
              { metric: "Patients", count: details.numberOfPatients || 0, fill: "var(--color-patients)" },
              { metric: "Clients", count: details.numberOfClients || 0, fill: "var(--color-clients)" },
              { metric: "Products", count: details.numberOfProducts || 0, fill: "var(--color-products)" },
              { metric: "Suppliers", count: details.numberOfSuppliers || 0, fill: "var(--color-suppliers)" },
            ];
            const barConfig = {
              count: { label: "Count" },
              vets: { label: "Veterinarians", color: "hsl(var(--primary))" },
              patients: { label: "Patients", color: "hsl(142 76% 36%)" },
              clients: { label: "Clients", color: "hsl(262 83% 58%)" },
              products: { label: "Products", color: "hsl(25 95% 53%)" },
              suppliers: { label: "Suppliers", color: "hsl(173 58% 39%)" },
            };

            return (
              <AccordionItem key={idx} value={String(idx)} className="border-b border-border last:border-b-0 px-4">
                <AccordionTrigger className="hover:no-underline py-4 [&[data-state=open]]:border-b [&[data-state=open]]:border-border">
                  <div className="flex flex-wrap items-center gap-3 text-left">
                    <Building2 className="h-5 w-5 text-[#1E3D3D] dark:text-[#D2EFEC] shrink-0" />
                    <span className="font-semibold text-foreground">{clinic.clinicName}</span>
                    <Badge variant="secondary" className="font-normal">
                      {ratios.completionRatio ?? 0}% completion
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {details.numberOfVeterinarians || 0} vets · {details.numberOfPatients || 0} patients
                    </Badge>
                    <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> Active
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-0">
                      {/* Bar chart: Clinic statistics */}
                      <div className="space-y-4 lg:border-r border-border pr-6">
                        <h3 className="text-sm font-medium text-foreground">Clinic statistics</h3>
                        <ChartContainer
                          config={barConfig}
                          className="h-[220px] w-full"
                        >
                          <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 8 }}>
                            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="metric" width={80} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="count" radius={4} fill="hsl(var(--primary))" />
                          </BarChart>
                        </ChartContainer>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Vets</span>
                            <span className="font-semibold text-foreground">{details.numberOfVeterinarians || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Patients</span>
                            <span className="font-semibold text-foreground">{details.numberOfPatients || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Clients</span>
                            <span className="font-semibold text-foreground">{details.numberOfClients || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Products</span>
                            <span className="font-semibold text-foreground">{details.numberOfProducts || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Suppliers</span>
                            <span className="font-semibold text-foreground">{details.numberOfSuppliers || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pie chart: Appointment analytics */}
                      <div className="space-y-4 lg:border-r border-border pr-6">
                        <h3 className="text-sm font-medium text-foreground">Appointment analytics</h3>
                        <ChartContainer
                          config={{
                            completed: { label: "Completed", color: "hsl(var(--chart-1))" },
                            canceled: { label: "Canceled", color: "hsl(var(--destructive))" },
                            other: { label: "Other", color: "hsl(var(--muted))" },
                          }}
                          className="mx-auto aspect-square max-h-[200px]"
                        >
                          <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie
                              data={pieData.length ? pieData : [{ name: "No data", value: 1, fill: "hsl(var(--muted))" }]}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={40}
                              outerRadius={80}
                            />
                          </PieChart>
                        </ChartContainer>
                        <div className="text-center space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            Total appointments: <span className="font-semibold text-foreground">{ratios.totalAppointments || 0}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Completion: <span className="font-semibold text-green-600 dark:text-green-400">{ratios.completionRatio ?? 0}%</span>
                          </p>
                        </div>
                      </div>

                      {/* Performance metrics */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-foreground">Performance metrics</h3>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-green-500/10 dark:bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">Completion rate</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{ratios.percentageOfCompleting ?? 0}</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Profit (products)</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">{clinic.productProfit ?? 0}</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-[#1E3D3D]/10 dark:bg-[#D2EFEC]/10 border border-[#1E3D3D]/20 dark:border-[#D2EFEC]/20">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#1E3D3D] dark:text-[#D2EFEC]">Profit (services)</span>
                              <span className="font-bold text-[#1E3D3D] dark:text-[#D2EFEC]">{clinic.serviceProfit ?? 0}</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Average rating</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">{clinic.averageRating ?? 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                          <span>Last updated: {new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  )
}