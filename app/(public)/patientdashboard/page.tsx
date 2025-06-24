"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Phone, Mail, Heart, PawPrint, CalendarDays, User, Building } from "lucide-react"

// Hardcoded data
const clientData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  avatar: "/images/logo.png"
}

const pets = [
  {
    id: 1,
    name: "Buddy",
    type: "Golden Retriever",
    age: "3 years",
    breed: "Golden Retriever",
    weight: "65 lbs",
    avatar: "/images/logo.png",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-20"
  },
  {
    id: 2,
    name: "Luna",
    type: "Cat",
    age: "2 years",
    breed: "Persian",
    weight: "8 lbs",
    avatar: "/images/logo.png",
    lastVisit: "2024-01-10",
    nextAppointment: null
  }
]

const appointments = [
  {
    id: 1,
    petName: "Buddy",
    date: "2024-02-20",
    time: "10:00 AM",
    type: "Annual Checkup",
    status: "upcoming",
    doctor: "Dr. Emily Chen",
    clinic: "PawTrack Veterinary Clinic",
    address: "123 Main Street, City, State 12345"
  },
  {
    id: 2,
    petName: "Buddy",
    date: "2024-01-15",
    time: "2:30 PM",
    type: "Vaccination",
    status: "completed",
    doctor: "Dr. Michael Rodriguez",
    clinic: "PawTrack Veterinary Clinic",
    address: "123 Main Street, City, State 12345"
  },
  {
    id: 3,
    petName: "Luna",
    date: "2024-01-10",
    time: "11:00 AM",
    type: "Dental Cleaning",
    status: "completed",
    doctor: "Dr. Sarah Wilson",
    clinic: "PawTrack Veterinary Clinic",
    address: "123 Main Street, City, State 12345"
  }
]

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
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={clientData.avatar} alt={clientData.name} />
              <AvatarFallback className="text-lg font-semibold">
                {clientData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {clientData.name}!</h1>
              <p className="text-gray-600">Manage your pets and appointments</p>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {clientData.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {clientData.phone}
            </div>
          </div>
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
                        {appointments.filter(apt => apt.status === "upcoming").length}
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
                        {appointments.filter(apt => apt.status === "completed").length}
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
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {appointment.petName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.petName}</p>
                          <p className="text-sm text-gray-600">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatDate(appointment.date)}</p>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
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
                  {pets.map((pet) => (
                    <div key={pet.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={pet.avatar} alt={pet.name} />
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {pet.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{pet.name}</p>
                        <p className="text-sm text-gray-600">{pet.breed} • {pet.age}</p>
                        <p className="text-sm text-gray-600">{pet.weight}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
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
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {appointment.petName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{appointment.petName}</h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <p className="text-gray-600 font-medium">{appointment.type}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(appointment.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {appointment.doctor}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              {appointment.clinic}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="bg-white shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-white">
                        <AvatarImage src={pet.avatar} alt={pet.name} />
                        <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                          {pet.name[0]}
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
                        <p className="text-lg font-semibold">{pet.age}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Weight</p>
                        <p className="text-lg font-semibold">{pet.weight}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Visit</p>
                        <p className="text-lg font-semibold">{formatDate(pet.lastVisit)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Next Appointment</p>
                        <p className="text-lg font-semibold">
                          {pet.nextAppointment ? formatDate(pet.nextAppointment) : "None scheduled"}
                        </p>
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
