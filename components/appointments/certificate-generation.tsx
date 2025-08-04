"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  FileText, 
  Heart, 
  Shield, 
  Syringe, 
  Pill, 
  Bug, 
  Cross, 
  Handshake,
  Clock,
  XCircle
} from "lucide-react"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useGetPatientById } from "@/queries/patients/get-patient-by-id"
import { useGetClientById } from "@/queries/clients/get-client"
import { useGetClinicById } from "@/queries/clinic/get-clinic-by-id"
import { useGetUserById } from "@/queries/users/get-user-by-id"

// Import all certificate components
import FitnessTravelCertificate from "./certification/fitness-travel-certificate"
import HealthHostelCertificate from "./certification/health-hostel-certificate"
import VaccinationCertificate from "./certification/vaccination-certificate"
import DewormingCertificate from "./certification/deworming-certificate"
import TickMedicineCertificate from "./certification/tick-medicine-certificate"
import EuthanasiaCertificate from "./certification/euthanasia-certificate"
import ConsentBondCertificate from "./certification/consent-bond-certificate"

interface CertificateGenerationProps {
  appointmentId: string
  patientId: string
  onClose: () => void
}

interface CertificateData {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  template: string
}

// Certificate types configuration
const certificateTypes: CertificateData[] = [
  {
    id: "fitness-travel",
    name: "Fitness Certificate for Travelling",
    description: "Certifies the pet is fit for travel and meets transportation requirements",
    icon: <Heart className="h-6 w-6" />,
    color: "text-red-600",
    bgColor: "bg-red-50",
    template: "fitness-travel"
  },
  {
    id: "health-hostel",
    name: "Health Certificate for Hostel",
    description: "Confirms the pet is healthy and suitable for boarding facilities",
    icon: <Shield className="h-6 w-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    template: "health-hostel"
  },
  {
    id: "vaccination",
    name: "Vaccination Certificate",
    description: "Documents all vaccinations and immunization records",
    icon: <Syringe className="h-6 w-6" />,
    color: "text-green-600",
    bgColor: "bg-green-50",
    template: "vaccination"
  },
  {
    id: "deworming",
    name: "Deworming Certificate",
    description: "Certifies deworming treatment and parasite control",
    icon: <Pill className="h-6 w-6" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    template: "deworming"
  },
  {
    id: "tick-medicine",
    name: "Tick Medicine Certificate",
    description: "Documents tick prevention and treatment protocols",
    icon: <Bug className="h-6 w-6" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    template: "tick-medicine"
  },
  {
    id: "euthanasia",
    name: "Euthanasia Certificate",
    description: "Official documentation for humane euthanasia procedures",
    icon: <Cross className="h-6 w-6" />,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    template: "euthanasia"
  },
  {
    id: "consent-bond",
    name: "Consent Bond Certificate",
    description: "Legal consent documentation for veterinary procedures",
    icon: <Handshake className="h-6 w-6" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    template: "consent-bond"
  }
]

export default function CertificateGeneration({ appointmentId, patientId, onClose }: CertificateGenerationProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null)

  // Fetch real data from APIs
  const { data: appointment, isLoading: isLoadingAppointment } = useGetAppointmentById(appointmentId)
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(patientId)
  const { data: client, isLoading: isLoadingClient } = useGetClientById(appointment?.clientId || '')
  const { data: clinic, isLoading: isLoadingClinic } = useGetClinicById(appointment?.clinicId || '')
  const { data: veterinarian, isLoading: isLoadingVet } = useGetUserById(appointment?.veterinarianId || '')

  const handleCertificateSelect = (certificate: CertificateData) => {
    setSelectedCertificate(certificate)
  }

  const handleBackToSelection = () => {
    setSelectedCertificate(null)
  }

  // Render the appropriate certificate component based on selection
  const renderSelectedCertificate = () => {
    if (!selectedCertificate || !appointment || !patient || !client || !clinic || !veterinarian) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
          <div className="text-center">
            <p className="text-gray-600">Loading certificate data...</p>
          </div>
        </div>
      )
    }

    const certificateProps = {
      appointmentId,
      patientId,
      onClose: handleBackToSelection
    }

    switch (selectedCertificate.template) {
      case "fitness-travel":
        return <FitnessTravelCertificate {...certificateProps} />
      case "health-hostel":
        return <HealthHostelCertificate {...certificateProps} />
      case "vaccination":
        return <VaccinationCertificate {...certificateProps} />
      case "deworming":
        return <DewormingCertificate {...certificateProps} />
      case "tick-medicine":
        return <TickMedicineCertificate {...certificateProps} />
      case "euthanasia":
        return <EuthanasiaCertificate {...certificateProps} />
      case "consent-bond":
        return <ConsentBondCertificate {...certificateProps} />
      default:
        return <div>Certificate template not found</div>
    }
  }

  // Show loading state while fetching data
  if (isLoadingAppointment || isLoadingPatient || isLoadingClient || isLoadingClinic || isLoadingVet) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-6xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Certificate Generation
            </SheetTitle>
          </SheetHeader>
          <div className="py-6 flex items-center justify-center">
            <div className="text-center">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading appointment data...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Certificate Generation
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {!selectedCertificate ? (
            // Certificate Selection View
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Certificate Type</h2>
                <p className="text-gray-600">Choose the type of certificate you want to generate for this appointment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificateTypes.map((certificate) => (
                  <Card 
                    key={certificate.id}
                    className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => handleCertificateSelect(certificate)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${certificate.bgColor}`}>
                          <div className={certificate.color}>
                            {certificate.icon}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-sm">{certificate.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">
                        {certificate.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            // Certificate Preview and Generation View
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCertificate.name}</h2>
                  <p className="text-gray-600">{selectedCertificate.description}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleBackToSelection}
                  className="flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Back to Selection
                </Button>
              </div>

              <div className="mb-6">
                {renderSelectedCertificate()}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
} 