"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Phone, Mail, Heart, PawPrint, CalendarDays, User, Building } from "lucide-react"
import { useContext } from "react";
import { RootContext } from "@/context/RootContext";
import { useGetPatients } from "@/queries/patients/get-patients";
import { useGetClientById } from "@/queries/clients/get-client";
import { useGetAppointments } from "@/queries/appointment/get-appointment";

interface Appointment {
  id: string;
  status: string;
  appointmentType?: string;
  appointmentDate?: string;
  patient?: {
    name?: string;
  };
  veterinarian?: {
    firstName: string;
    lastName: string;
  };
  clinic?: {
    name: string;
  };
}

// const { user } = useContext(RootContext);

const medicalRecords = [
  {
    id: 1,
    petName: "Buddy",
    date: "2024-01-15",
    type: "Vaccination",
    description: "Annual vaccinations including rabies, distemper, and bordetella",
    doctor: "Dr. Michael Rodriguez"
  },
  {
    id: 2,
    petName: "Luna",
    date: "2024-01-10",
    type: "Dental Procedure",
    description: "Professional dental cleaning and examination",
    doctor: "Dr. Sarah Wilson"
  }
]

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const rootContext = useContext(RootContext);
  const handleLogout = rootContext?.handleLogout;
  const user = rootContext?.user;

  const clientId = user?.id || "";
  const { data, isLoading, error } = useGetPatients(1, 100, "", clientId);
  const pets = data?.items || [];

  const { data: clientData, isLoading: isClientLoading, error: clientError } = useGetClientById(clientId);

  const appointmentQuery = useGetAppointments({
    search: null,
    status: null,
    provider: null,
    dateFrom: null,
    dateTo: null,
    clinicId: null,
    patientId: null,
    clientId,
    veterinarianId: null,
    roomId: null,
    pageNumber: 1,
    pageSize: 100,
  });
  const appointments = appointmentQuery.data?.items || [];
  const isAppointmentsLoading = appointmentQuery.isLoading;
  const appointmentsError = appointmentQuery.error;

  if (!user) {
    return <div>Loading user...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Upcoming</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {isClientLoading ? (
            <div>Loading client info...</div>
          ) : clientError ? (
            <div>Error loading client info.</div>
          ) : clientData && (
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/images/logo.png" alt={`${clientData.firstName} ${clientData.lastName}`} />
                <AvatarFallback className="text-lg font-semibold">
                  {clientData.firstName[0]}{clientData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {clientData.firstName} {clientData.lastName}!
                </h1>
                <p className="text-gray-600">Manage your pets and appointments</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {clientData.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {clientData.phonePrimary}
                </div>
              </div>
              <Button variant="secondary" onClick={handleLogout} className="ml-auto">Logout</Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="pets">My Pets</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                        {appointments.filter((apt: Appointment) => apt.status === "upcoming").length}
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
                        {appointments.filter((apt: Appointment) => apt.status === "completed").length}
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

            {/* Recent Activity */}
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
                    appointments.slice(0, 3).map((appointment: Appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {appointment.patient?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patient?.name}</p>
                            <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.appointmentDate ? formatDate(appointment.appointmentDate) : ""}
                          </p>
                          {getStatusBadge(appointment.status)}
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
                  {isLoading ? (
                    <div>Loading pets...</div>
                  ) : error ? (
                    <div>Error loading pets.</div>
                  ) : pets.length === 0 ? (
                    <div>No pets found.</div>
                  ) : (
                    pets.map((pet) => (
                      <div key={pet.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {pet.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{pet.name}</p>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {
                              pet.dateOfBirth
                                ? `${Math.floor(
                                    (new Date().getTime() - new Date(pet.dateOfBirth).getTime()) /
                                      (365.25 * 24 * 60 * 60 * 1000)
                                  )} years`
                                : "Unknown age"}
                          </p>
                          <p className="text-sm text-gray-600">{pet.weightKg} kg</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>View and manage your pet appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isAppointmentsLoading ? (
                    <div>Loading appointments...</div>
                  ) : appointmentsError ? (
                    <div>Error loading appointments.</div>
                  ) : appointments.length === 0 ? (
                    <div>No appointments found.</div>
                  ) : (
                    appointments.map((appointment: Appointment) => (
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
                                {getStatusBadge(appointment.status)}
                              </div>
                              <p className="text-gray-600 font-medium">{appointment.appointmentType}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {appointment.appointmentDate ? formatDate(appointment.appointmentDate) : ""}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {appointment.veterinarian ? `${appointment.veterinarian.firstName} ${appointment.veterinarian.lastName}` : ""}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" />
                                {appointment.clinic?.name}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6">
            {isLoading ? (
              <div>Loading pets...</div>
            ) : error ? (
              <div>Error loading pets.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <Card key={pet.id} className="bg-white shadow-lg border-0 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white">
                          <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                            {pet.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-white">{pet.name}</CardTitle>
                          <CardDescription className="text-blue-100">{pet.breed}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Age</p>
                          <p className="text-lg font-semibold">
                            {pet.dateOfBirth
                              ? `${Math.floor(
                                  (new Date().getTime() - new Date(pet.dateOfBirth).getTime()) /
                                    (365.25 * 24 * 60 * 60 * 1000)
                                )} years`
                              : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Weight</p>
                          <p className="text-lg font-semibold">
                            {pet.weightKg ? `${pet.weightKg} kg` : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Last Visit</p>
                          <p className="text-lg font-semibold">—</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Next Appointment</p>
                          <p className="text-lg font-semibold">—</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1">View Medical Records</Button>
                        <Button variant="outline">Book Appointment</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>View your pets' medical history and treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{record.petName}</h3>
                            <Badge variant="outline">{record.type}</Badge>
                          </div>
                          <p className="text-gray-600">{record.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(record.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {record.doctor}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
