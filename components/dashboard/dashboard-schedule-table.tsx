"use client"

import { useState } from "react"
import { Clock, Eye, Check, X, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useApproveClientRegistration } from "@/queries/clientRegistration/create-approve"
import { useGetClientRegistrationById } from "@/queries/clientRegistration/get-registration-by-id"
import { toast } from "@/components/ui/use-toast"

interface Appointment {
  startTime?: string;
  roomSlot?: {
    startTime?: string;
  };
  patient?: { name?: string; species?: string } | string;
  reason?: string;
  status?: string;
}

interface DashboardScheduleTableProps {
  appointments: Appointment[];
  pendingRegistrations?: any[]; // Add prop for pending registrations
}

export const DashboardScheduleTable = ({ appointments, pendingRegistrations = [] }: DashboardScheduleTableProps) => {
  // State for handling registration details
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  
  // Mutations and queries
  const approveMutation = useApproveClientRegistration();
  const { data: drawerData, isLoading: isDrawerLoading } = useGetClientRegistrationById(drawerId || "");
  
  // Helper to format time from 'HH:mm:ss' to 'h:mm A'
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    
    try {
      // Handle different time formats
      let hour, minute;
      
      if (timeStr.includes(':')) {
        [hour, minute] = timeStr.split(":");
      } else {
        // If it's not in expected format, return as is
        return timeStr;
      }
      
      const date = new Date();
      date.setHours(Number(hour), Number(minute));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeStr; // Return original string if there's an error
    }
  };

  // Calculate appointment statistics
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === "completed").length;
  const inProgressAppointments = appointments.filter(a => a.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Summary Cards */}
        <div className={`grid ${pendingRegistrations.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'} grid-cols-1 gap-6 flex-1 lg:w-1/2`}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAppointments}</p>
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
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inProgressAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending User Registrations Card - 50% width on desktop */}
        {pendingRegistrations.length > 0 && (
          <Card className="col-span-1 border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50 lg:w-1/2 flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Pending User Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '112px' }}>
                {pendingRegistrations.map((reg: any) => (
                  <div key={reg.id} className="flex items-center justify-between p-2">
                    <span className="font-semibold text-lg text-primary">{reg.firstName}</span>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => { setDrawerId(reg.id); setDrawerOpen(true); }} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={() => approveMutation.mutate({ registrationId: reg.id, isApproved: true })} 
                        title="Approve"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="bg-red-400 hover:bg-red-500" 
                        onClick={() => { 
                          setSelectedRegistrationId(reg.id); 
                          setRejectDialogOpen(true); 
                        }} 
                        title="Reject"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointments Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Patient
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Reason
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {appointments.map((appointment, index) => (
                <tr key={index} className="dark:hover:bg-slate-750">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {appointment.roomSlot && appointment.roomSlot.startTime 
                      ? formatTime(appointment.roomSlot.startTime)
                      : formatTime(appointment.startTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {typeof appointment.patient === 'string'
                      ? appointment.patient
                      : `${appointment.patient?.name || ''}${appointment.patient?.species ? ` (${appointment.patient.species})` : ''}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                     {appointment.reason || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        appointment.status === "in_progress"
                          ? "theme-badge-info"
                          : appointment.status === "completed"
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
                       {appointment.status ? appointment.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Details Sheet */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Registration Details</SheetTitle>
          </SheetHeader>
          <div className="p-6">
            {isDrawerLoading ? (
              <div>Loading...</div>
            ) : drawerData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                    <p className="font-semibold">{drawerData.firstName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                    <p className="font-semibold">{drawerData.lastName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="font-semibold">{drawerData.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="font-semibold">{drawerData.phonePrimary}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p className="font-semibold">{drawerData.addressLine1}</p>
                  <p className="font-semibold">{drawerData.city}, {drawerData.state} {drawerData.postalCode}</p>
                </div>
                {drawerData.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p>{drawerData.notes}</p>
                  </div>
                )}
                <div className="pt-4 flex justify-end gap-2">
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      approveMutation.mutate({ registrationId: drawerData.id, isApproved: true });
                      setDrawerOpen(false);
                    }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      setSelectedRegistrationId(drawerData.id);
                      setRejectDialogOpen(true);
                      setDrawerOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : <div>No data found.</div>}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="Enter rejection reason"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRegistrationId) {
                  approveMutation.mutate({ registrationId: selectedRegistrationId, isApproved: false, rejectionReason: rejectReason });
                }
                setRejectDialogOpen(false);
                setRejectReason("");
              }}
              disabled={approveMutation.isPending}
            >
              Reject
            </Button>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 