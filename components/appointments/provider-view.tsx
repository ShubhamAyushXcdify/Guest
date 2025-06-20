"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useGetProviderStats, ProviderStats } from "@/queries/providers/get-provider-stats"
import { AppointmentSearchParamsType } from "@/components/appointments/hooks/useAppointmentFilter"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, List } from "lucide-react"
import AppointmentCalendar from "./appointment-calendar"


export default function ProviderView({ onAppointmentClick }: { onAppointmentClick: (id: string) => void }) {
  const { data: providers = [], isLoading: isLoadingProviders } = useGetProviderStats();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"list" | "calendar">("list");

  // Find the selected provider object
  const selectedProviderObj = providers.find((p: ProviderStats) => p.id === selectedProvider);

  // Build search params for appointments
  const searchParams: AppointmentSearchParamsType = {
    search: null,
    status: null,
    provider: selectedProviderObj ? selectedProviderObj.name : null,
    dateFrom: null,
    dateTo: null,
  };

  // Use appointments from the selected provider object, ensure it's always an array
  const appointments = Array.isArray(selectedProviderObj?.appointments) ? selectedProviderObj.appointments : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "in_progress":
        return "theme-badge-info"
      case "completed":
        return "theme-badge-success"
      case "scheduled":
      case "confirmed":
        return "theme-badge-neutral"
      default:
        return "theme-badge-neutral"
    }
  }

  if (isLoadingProviders) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Provider Cards */}
      <div className="w-full max-w-screen-2xl overflow-x-auto mx-auto">
        <div className="flex gap-6 pb-4">
          {providers.map((provider: ProviderStats) => (
            <div
              key={provider.id}
              className="min-w-[320px] max-w-[340px] flex-shrink-0"
            >
              {/* Keep all your existing card code exactly as is */}
              <Card
                className={`cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700 ${
                  selectedProvider === provider.id
                    ? "ring-2 ring-theme-primary ring-offset-2 dark:ring-offset-slate-900"
                    : ""
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src="/diverse-avatars.png" alt={provider.name} />
                      <AvatarFallback>{provider.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {provider.role} • {provider.specialty}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{provider.total}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">{provider.done}</div>
                      <div className="text-xs text-green-600 dark:text-green-400">Done</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{provider.pending}</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      
      {/* Selected Provider Appointments */}
      {selectedProvider && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {selectedProviderObj?.name}'s Appointments
            </h2>
            <div className="flex items-center gap-4">
              <Tabs 
                value={viewType} 
                onValueChange={(value) => setViewType(value as "list" | "calendar")}
                className="mr-4"
              >
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline-block">List View</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="hidden sm:inline-block">Calendar View</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button className="theme-button text-white">View Schedule</Button>
            </div>
          </div>
          
          {viewType === "list" ? (
            <div className="overflow-x-auto">
              {appointments.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No appointments found.</div>
              ) : (
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
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Visit Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {appointments.map((appointment: any) => {
                      const datePart = appointment.appointmentDate?.split('T')[0];
                      const timePart = appointment.startTime;
                      const dateTimeString = datePart && timePart ? `${datePart}T${timePart}` : null;
                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {dateTimeString ? new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {appointment.patient?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {`${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {appointment.appointmentType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusBadgeClass(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAppointmentClick(appointment.id)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div>
              <AppointmentCalendar onAppointmentClick={(id) => onAppointmentClick(id.toString())} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
