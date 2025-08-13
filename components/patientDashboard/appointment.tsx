"use client"
import { useContext, useState } from "react";
import { PatientDashboardContext } from "@/components/patientDashboard/PatientDashboardProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PatientAppointmentForm from "@/components/patients/patient-appointment-form";

export default function AppointmentsPage() {
  const { appointments, isAppointmentsLoading, appointmentsError, pets, isClient, clientId, refetchAppointments } = useContext(PatientDashboardContext);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!isClient) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return '';
    }
  };
  
  // Helper function to format time from HH:MM:SS to HH:MM format
  const formatTimeString = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Called when the modal closes
  const handleClose = (wasSuccess?: boolean) => {
    setIsAppointmentFormOpen(false);
    if (wasSuccess) {
      refetchAppointments();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center md:mb-4">
        <h2 className="text-xl font-bold">My Appointments</h2>
        <div className="flex flex-col items-center gap-2">
          <Button className="theme-button text-white" disabled={pets.length === 0} onClick={() => setIsAppointmentFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden md:flex">New Appointment</span>
          </Button>
          {pets.length === 0 && <span className="text-red-500 text-xs"> (No pets registered)</span>}
        </div>
      </div>
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>View and manage your pet appointments</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {isAppointmentsLoading ? (
              <div>Loading appointments...</div>
            ) : appointmentsError ? (
              <div>Error loading appointments.</div>
            ) : appointments.length === 0 ? (
              <div>No appointments found.</div>
            ) : (
              appointments.map((appointment: any) => (
                <div key={appointment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {appointment.patient?.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{appointment.patient?.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            appointment.status === 'confirmed' || 
                            appointment.status === 'completed' || 
                            appointment.status === 'scheduled' ? 
                            'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || "Requested"}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium">{appointment.appointmentType?.name}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {isClient && appointment.appointmentDate ? formatDate(appointment.appointmentDate) : ""}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {isClient && appointment.appointmentTimeFrom && appointment.appointmentTimeTo ? 
                              `${formatTimeString(appointment.appointmentTimeFrom)} - ${formatTimeString(appointment.appointmentTimeTo)}` :
                              appointment?.roomSlot?.startTime && appointment?.roomSlot?.endTime ?
                              `${formatTimeString(appointment.roomSlot.startTime)} - ${formatTimeString(appointment.roomSlot.endTime)}` :
                              "Time not set"
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {appointment?.veterinarian ? `${appointment?.veterinarian?.firstName} ${appointment?.veterinarian?.lastName}` : ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {appointment.clinic?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      {/* Modal for new appointment */}
      <PatientAppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={handleClose}
        clientId={clientId}
        patients={pets}
      />
    </div>
  );
}
