"use client"

import { useState, useMemo } from "react"
import { useGetDashboardSummary } from "@/queries/dashboard/get-dashboard-summary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import { TrendingUp, Users, Stethoscope, Package, Truck, Building2 } from "lucide-react"
import { DatePickerWithRangeV2 } from "@/components/ui/custom/date/date-picker-with-range";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useGetAppointments } from "@/queries/appointment/get-appointment"

export const AdminDashboard = () => {
  const today = new Date();

  const startOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Convert local time to UTC ISO string
  const startOfDay = new Date(startOfDayLocal.getTime() - startOfDayLocal.getTimezoneOffset() * 60000);
  const endOfDay = new Date(endOfDayLocal.getTime() - endOfDayLocal.getTimezoneOffset() * 60000);

  // Date range state for admin dashboard
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay,
    to: endOfDay
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
    pageNumber: 1,
    pageSize: 5,
    isRegistered: true
  }), []);

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

  const dashboardSummaryParams = useMemo(() => ({
    fromDate: dateRange?.from ? dateRange.from.toISOString().split('T')[0] : startOfDay.toISOString().split('T')[0],
    toDate: dateRange?.to ? dateRange.to.toISOString().split('T')[0] : endOfDay.toISOString().split('T')[0],
  }), [dateRange, startOfDay, endOfDay]);

  const { data: dashboardSummaryData, isLoading, error } = useGetDashboardSummary(dashboardSummaryParams);

  // Get appointment requests
  const appointmentRequests = appointmentRequestsData?.items || [];

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading dashboard summary</div>;

  const clinics = dashboardSummaryData?.data?.clinics || [];

  return (
    <div className="p-6 space-y-8">
      {/* Date Range Picker */}
      <div className="flex justify-between items-center">
      {/* Admin Header */}
      <div className="">
        <h1 className="text-3xl font-bold tracking-tight theme-text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground text-md">Monitor and manage all clinics across the system</p>
      </div>
      <DatePickerWithRangeV2
          date={dateRange}
          setDate={setDateRange}
          showYear={true}
          // className="w-[350px]"
        />
      </div>

      {/* NEW LAYOUT: Summary Cards in Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Summary Cards - 50% width on desktop, 2 columns if appointment requests are present */}
        <div className={`grid ${appointmentRequests.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-4'} grid-cols-1 gap-6 flex-1 lg:w-1/2`}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                  <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Clinics</p>
                  <p className="text-2xl font-bold theme-text-primary">{clinics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold theme-text-accent">
                    {clinics.reduce((sum: number, clinic: any) => sum + (clinic.clinicDetails?.numberOfPatients || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                  <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-md font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {clinics.reduce((sum: number, clinic: any) => sum + (clinic.clinicDetails?.numberOfProducts || 0), 0)}
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

      {/* Clinic Cards */}
      <div className="grid gap-6">
        {clinics.map((clinic: any, idx: number) => {
          const details = clinic.clinicDetails || {};
          const ratios = clinic.appointmentCompletionRatios || {};
          const pieData = [
            { name: "Completed", value: ratios.completedAppointments || 0, fill: "hsl(var(--primary))" },
            { name: "Canceled", value: ratios.canceledAppointments || 0, fill: "hsl(var(--destructive))" },
            { name: "Other", value: (ratios.totalAppointments || 0) - (ratios.completedAppointments || 0) - (ratios.canceledAppointments || 0), fill: "hsl(var(--muted))" },
          ];
          
          return (
            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 border">
              <CardHeader className="pb-4 border-b mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold theme-text-primary">{clinic.clinicName}</CardTitle>
                    <CardDescription className="text-md">Clinic Performance Overview</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-md text-muted-foreground">Active</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Grid */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium theme-text-secondary">Clinic Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span className="text-md text-muted-foreground">Veterinarians</span>
                      </div>
                      <p className="text-2xl font-bold theme-text-primary">{details.numberOfVeterinarians || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-md text-muted-foreground">Patients</span>
                      </div>
                      <p className="text-2xl font-bold theme-text-secondary">{details.numberOfPatients || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-md text-muted-foreground">Clients</span>
                      </div>
                      <p className="text-2xl font-bold theme-text-accent">{details.numberOfClients || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-md text-muted-foreground">Products</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{details.numberOfProducts || 0}</p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-md text-muted-foreground">Suppliers</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{details.numberOfSuppliers || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium theme-text-secondary">Appointment Analytics</h3>
                  <ChartContainer
                    config={{
                      completed: { label: "Completed", color: "hsl(var(--primary))" },
                      canceled: { label: "Canceled", color: "hsl(var(--destructive))" },
                      other: { label: "Other", color: "hsl(var(--muted))" },
                    }}
                    className="mx-auto aspect-square max-h-[200px]"
                  >
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie 
                        data={pieData} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={40}
                        outerRadius={80}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="text-center space-y-2">
                    <p className="text-md text-muted-foreground">
                      Total: <span className="font-semibold theme-text-primary">{ratios.totalAppointments || 0}</span>
                    </p>
                    <p className="text-md text-muted-foreground">
                      Completion: <span className="font-semibold text-green-600 dark:text-green-400">{ratios.completionRatio || 0}%</span>
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium theme-text-secondary">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <span className="text-md font-medium text-green-700 dark:text-green-300">Completion Rate</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">{ratios.percentageOfCompleting || 0}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-md font-medium text-blue-700 dark:text-blue-300">Efficiency Score</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">85%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <span className="text-md font-medium text-purple-700 dark:text-purple-300">Patient Satisfaction</span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">92%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Performance trending up by 5.2% this month</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  )
} 