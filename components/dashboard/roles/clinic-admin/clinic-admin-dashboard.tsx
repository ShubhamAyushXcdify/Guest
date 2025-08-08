"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Stethoscope, Package, Truck, Building2, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { DatePickerWithRangeV2 } from "@/components/ui/custom/date/date-picker-with-range"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { useRootContext } from "@/context/RootContext"
import { useGetClinicAdminDashboard } from "@/queries/dashboard/get-clinic-admin-dashboard"
import { AppointmentCompletionRatios, ClinicDetail } from "@/queries/dashboard/get-clinic-admin-dashboard"
import { useGetAppointments } from "@/queries/appointment/get-appointment"
import { Badge } from "@/components/ui/badge"
import { DashboardWelcomeHeader } from "../../shared/dashboard-welcome-header"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Define appointment interface
interface Appointment {
  id: string;
  appointmentDate: string;
  startTime?: string;
  appointmentTimeFrom?: string;
  appointmentTimeTo?: string;
  status?: string;
  reason?: string;
  roomSlot?: {
    startTime?: string;
  };
  patient?: {
    name?: string;
    species?: string
  } | string;
  veterinarian?: {
    name?: string;
  };
}

export const ClinicAdminDashboard = ({
  onNewPatient,
  onNewAppointment
}: {
  onNewPatient: () => void;
  onNewAppointment: () => void;
}) => {
  const today = new Date();
  const { clinic, user } = useRootContext();

  const startOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  
  // For weekly stats, get the first day of the current week (Sunday)
  const startOfWeekLocal = new Date(today);
  startOfWeekLocal.setDate(today.getDate() - today.getDay());
  startOfWeekLocal.setHours(0, 0, 0, 0);

  // Convert local time to UTC ISO string
  const startOfDay = new Date(startOfDayLocal.getTime() - startOfDayLocal.getTimezoneOffset() * 60000);
  const endOfDay = new Date(endOfDayLocal.getTime() - endOfDayLocal.getTimezoneOffset() * 60000);
  
  // Date range for the dashboard summary
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeekLocal,
    to: today
  });

  // Search parameters for today's appointments
  const todaySearchParams = useMemo(() => ({
    search: null,
    status: null,
    provider: null,
    dateFrom: startOfDay.toISOString(),
    dateTo: endOfDay.toISOString(),
    clinicId: clinic?.id ?? null,
    patientId: null,
    clientId: null,
    veterinarianId: null,
    roomId: null,
    pageNumber: 1,
    pageSize: 20,
    isRegistered: false
  }), [startOfDay, endOfDay, clinic?.id]);

  // Clinic admin dashboard parameters
  const dashboardParams = useMemo(() => ({
    clinicId: clinic?.id ?? '',
    fromDate: dateRange?.from ? dateRange.from.toISOString().split('T')[0] : startOfWeekLocal.toISOString().split('T')[0],
    toDate: dateRange?.to ? dateRange.to.toISOString().split('T')[0] : today.toISOString().split('T')[0]
  }), [clinic?.id, dateRange, startOfWeekLocal, today]);

  // Fetch data
  const { data: todayAppointmentsData } = useGetAppointments(todaySearchParams);
  const { data: clinicDashboardData, isLoading, error } = useGetClinicAdminDashboard(dashboardParams);

  // Create pie data for appointment distribution
  const pieData = useMemo(() => {
    if (!clinicDashboardData?.appointmentCompletionRatios) return [];
    
    const metrics = clinicDashboardData.appointmentCompletionRatios;
    return [
      { name: "Completed", value: metrics.completedAppointments || 0, color: "#10b981" },
      { name: "Scheduled", value: (metrics.totalAppointments - metrics.completedAppointments - metrics.canceledAppointments) || 0, color: "#3b82f6" },
      { name: "Canceled", value: metrics.canceledAppointments || 0, color: "#ef4444" }
    ];
  }, [clinicDashboardData]);

  // Process appointments data
  const todayAppointments = (todayAppointmentsData?.items || []) as Appointment[];

  // Format time helper function
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    
    try {
      let hour, minute;
      
      if (timeStr.includes(':')) {
        [hour, minute] = timeStr.split(":");
      } else {
        return timeStr;
      }
      
      const date = new Date();
      date.setHours(Number(hour), Number(minute));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeStr;
    }
  };

  if (isLoading) return <div className="p-6">Loading clinic dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading clinic dashboard</div>;
  if (!clinicDashboardData) return <div className="p-6">No data available</div>;

  console.log('Clinic Dashboard Data:', clinicDashboardData);

  // Extract clinic details
  const clinicName = clinicDashboardData?.clinicName || "Clinic";
  
  // Check for both clinicDetail and clinicDetails using type assertion
  // This handles API inconsistency between interface and actual response
  const responseAny = clinicDashboardData as any;
  const clinicDetail = responseAny?.clinicDetails || clinicDashboardData?.clinicDetail || {};
  const completionMetrics = clinicDashboardData?.appointmentCompletionRatios || {};

  return (
    <div className="p-6 space-y-8">
      {/* Page Header & Date Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight theme-text-primary">{clinicName} Dashboard</h1>
          <p className="text-muted-foreground">Clinic performance and daily operations overview</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <DatePickerWithRangeV2
            date={dateRange}
            setDate={setDateRange}
            showYear={true}
            className="w-[280px]"
          />
          <div className="flex gap-2">
            <Button className="theme-button text-white" onClick={onNewPatient}>
              New Patient
            </Button>
            <Button className="theme-button text-white" onClick={onNewAppointment}>
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completionMetrics?.totalAppointments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completionMetrics?.completedAppointments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Canceled</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{completionMetrics?.canceledAppointments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinic Statistics Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Clinic Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Veterinarians</span>
                </div>
                <p className="text-2xl font-bold theme-text-primary">{clinicDetail?.numberOfVeterinarians || 0}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Patients</span>
                </div>
                <p className="text-2xl font-bold theme-text-secondary">{clinicDetail?.numberOfPatients || 0}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Clients</span>
                </div>
                <p className="text-2xl font-bold theme-text-accent">{clinicDetail?.numberOfClients || 0}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Products</span>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{clinicDetail?.numberOfProducts || 0}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Suppliers</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{clinicDetail?.numberOfSuppliers || 0}</p>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Completion Rate</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{completionMetrics?.percentageOfCompleting || "0%"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Appointment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold theme-text-primary">{completionMetrics?.totalAppointments || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-green-600">{completionMetrics?.completedAppointments || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Canceled</p>
                <p className="text-xl font-bold text-red-600">{completionMetrics?.canceledAppointments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Veterinarian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {todayAppointments.map((appointment: Appointment, index: number) => (
                    <tr key={index} className="dark:hover:bg-slate-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        {formatTime(
                          appointment.appointmentTimeFrom ||
                          appointment.startTime ||
                          (appointment.roomSlot && appointment.roomSlot.startTime)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {typeof appointment.patient === 'string'
                          ? appointment.patient
                          : `${appointment.patient?.name || ''}${appointment.patient?.species ? ` (${appointment.patient.species})` : ''}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {appointment.veterinarian?.name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {appointment.reason || ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            appointment.status === "completed"
                              ? "theme-badge-success"
                              : appointment.status === "in_room"
                              ? "theme-badge-warning"
                              : appointment.status === "scheduled"
                              ? "theme-badge-neutral"
                              : appointment.status === "cancelled"
                              ? "theme-badge-destructive"
                              : "theme-badge-neutral"
                          }
                        >
                          {appointment.status ? appointment.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : ''}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No appointments scheduled for today.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 