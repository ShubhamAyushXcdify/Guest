"use client"
import { useContext } from "react";
import { PatientDashboardContext } from "@/components/patientDashboard/PatientDashboardProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, PawPrint, Heart, Building, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function OverviewPage() {
  const { pets, petsLoading, petsError, appointments, isAppointmentsLoading, appointmentsError, isClient } = useContext(PatientDashboardContext);

  // Helper functions for formatting
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
  const calculateAge = (dateOfBirth: string) => {
    if (!isClient || !dateOfBirth) return 'Unknown';
    try {
      return `${Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((apt: any) => apt.status === "upcoming").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <PawPrint className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pets</p>
                <p className="text-2xl font-bold text-gray-900">{pets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((apt: any) => apt.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Preferred Clinic</p>
                <p className="text-sm font-bold text-gray-900">PawTrack Veterinary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAppointmentsLoading ? (
              <div>Loading appointments...</div>
            ) : appointmentsError ? (
              <div>Error loading appointments.</div>
            ) : appointments.length === 0 ? (
              <div>No appointments found.</div>
            ) : (
              appointments.slice(0, 3).map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {appointment.patient?.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient?.name}</p>
                      <p className="text-sm text-gray-600">{appointment.appointmentType?.name || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {isClient && appointment.appointmentDate ? formatDate(appointment.appointmentDate) : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              My Pets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {petsLoading ? (
              <div>Loading pets...</div>
            ) : petsError ? (
              <div>Error loading pets.</div>
            ) : pets.length === 0 ? (
              <div>No pets found.</div>
            ) : (
              pets.map((pet: any) => (
                <div key={pet.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {pet.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-600">
                      {pet.breed} • {isClient && pet.dateOfBirth ? calculateAge(pet.dateOfBirth) : "Unknown age"}
                    </p>
                    <p className="text-sm text-gray-600">{pet.weightKg} kg</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
