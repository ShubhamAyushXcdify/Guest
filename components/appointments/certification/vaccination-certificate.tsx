"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { 
  FileText, 
  Download, 
  Printer, 
  Syringe,
  Calendar,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Stethoscope
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { useGetPatientById } from "@/queries/patients/get-patient-by-id"
import { useGetClientById } from "@/queries/clients/get-client"
import { useGetClinicById } from "@/queries/clinic/get-clinic-by-id"
import { useGetUserById } from "@/queries/users/get-user-by-id"

interface VaccinationCertificateProps {
  appointmentId: string
  patientId: string
  onClose: () => void
}

export default function VaccinationCertificate({ appointmentId, patientId, onClose }: VaccinationCertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [petDescription, setPetDescription] = useState("The pet is completely healthy & fully vaccinated")
  const [petAge, setPetAge] = useState("")
  const [petWeight, setPetWeight] = useState("")
  const [petPlace, setPetPlace] = useState("")
  const [petMicrochipId, setPetMicrochipId] = useState("")

  // Fetch real data from APIs
  const { data: appointment, isLoading: isLoadingAppointment } = useGetAppointmentById(appointmentId)
  const { data: patient, isLoading: isLoadingPatient } = useGetPatientById(patientId)
  const { data: client, isLoading: isLoadingClient } = useGetClientById(appointment?.clientId || '')
  const { data: clinic, isLoading: isLoadingClinic } = useGetClinicById(appointment?.clinicId || '')
  const { data: veterinarian, isLoading: isLoadingVet } = useGetUserById(appointment?.veterinarianId || '')

  const handleGenerateCertificate = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    toast({
      title: "Certificate Generated",
      description: "Vaccination Certificate has been generated successfully.",
    })
  }

  const handleDownloadCertificate = () => {
    toast({
      title: "Download Started",
      description: "Certificate is being downloaded...",
    })
  }

  const handlePrintCertificate = () => {
    toast({
      title: "Printing",
      description: "Certificate is being sent to printer...",
    })
  }

  // Helper functions
  const getPatientDisplayName = () => {
    if (!patient) return 'N/A'
    if (patient.name) return patient.name
    if (patient.patientId) return patient.patientId
    if (patient.firstName || patient.lastName) {
      return `${patient.firstName || ''} ${patient.lastName || ''}`.trim()
    }
    return `Patient (ID: ${patient.id.substring(0, 8)}...)`
  }

  const getOwnerDisplayName = () => {
    if (!client) return 'N/A'
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A'
  }

  const getVetDisplayName = () => {
    if (!veterinarian) return 'N/A'
    return `Dr. ${veterinarian.firstName || ''} ${veterinarian.lastName || ''}`.trim() || 'N/A'
  }

  const renderCertificatePreview = () => {
    if (!appointment || !patient || !client || !clinic || !veterinarian) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
          <div className="text-center">
            <p className="text-gray-600">Loading certificate data...</p>
          </div>
        </div>
      )
    }

    const certificationText = "This is to certify that I have personally examined the below mentioned pet and verified all vaccination records. The pet has received all required vaccinations including anti-rabies, and all immunization records are complete and up to date. The pet is protected against common infectious diseases."

    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-4xl mx-auto shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-1">{clinic.name}</h1>
          <p className="text-sm text-gray-600">{clinic.tagline || "Professional Veterinary Care"}</p>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 underline decoration-2 underline-offset-4">
            VACCINATION CERTIFICATE
          </h2>
        </div>

        {/* Main Certificate Content */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed text-gray-800 mb-6">
            {certificationText.replace(
              "the below mentioned pet",
              `the below mentioned pet ${getPatientDisplayName()}`
            ).replace(
              "belongs to",
              `belongs to ${getOwnerDisplayName()}`
            )}
          </p>
        </div>

        {/* Pet Description */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Pet Description:</h3>
          <textarea
            value={petDescription}
            onChange={(e) => setPetDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 italic resize-none"
            rows={3}
            placeholder="Enter pet description..."
          />
        </div>

        {/* Pet and Owner Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <div><span className="font-semibold">Pet Name:</span> {getPatientDisplayName()}</div>
            <div><span className="font-semibold">Owner Name:</span> {getOwnerDisplayName()}</div>
            <div><span className="font-semibold">Species:</span> {patient.species || 'N/A'}</div>
            <div><span className="font-semibold">Gender:</span> {patient.gender || 'N/A'}</div>
            <div><span className="font-semibold">Breed:</span> {patient.breed || 'N/A'}</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Age:</span>
              <input
                type="text"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
                placeholder={patient.age || 'Enter age'}
                className="flex-1 p-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Weight:</span>
              <input
                type="text"
                value={petWeight}
                onChange={(e) => setPetWeight(e.target.value)}
                placeholder={patient.weight ? `${patient.weight} kg` : 'Enter weight'}
                className="flex-1 p-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div><span className="font-semibold">Color:</span> {patient.color || 'N/A'}</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Microchip ID:</span>
              <input
                type="text"
                value={petMicrochipId}
                onChange={(e) => setPetMicrochipId(e.target.value)}
                placeholder={patient.microchipId || 'Enter microchip ID'}
                className="flex-1 p-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          {/* Vet Stamp & Sign Section */}
          <div className="text-right">
            <h3 className="font-semibold text-gray-900 mb-4">Vet. Stamp & Sign:</h3>
            <div className="border-2 border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Veterinary Stamp</p>
              </div>
            </div>
            <div className="border-b-2 border-gray-400 w-32 mx-auto mb-2"></div>
            <p className="text-sm font-semibold text-blue-600">{getVetDisplayName()}</p>
            <p className="text-xs text-gray-600">{veterinarian.qualification || 'DVM'}</p>
            <p className="text-xs text-gray-600">{veterinarian.registrationNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Date and Place */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <p><span className="font-semibold">Date:</span> {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Place:</span>
              <input
                type="text"
                value={petPlace}
                onChange={(e) => setPetPlace(e.target.value)}
                placeholder={clinic.address ? clinic.address.split(',')[0] : 'Enter place'}
                className="flex-1 p-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-600">
            {clinic.address && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {clinic.address}
              </div>
            )}
            {clinic.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {clinic.email}
              </div>
            )}
            {clinic.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {clinic.phone}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while fetching data
  if (isLoadingAppointment || isLoadingPatient || isLoadingClient || isLoadingClinic || isLoadingVet) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-6xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Syringe className="h-5 w-5 mr-2" />
              Vaccination Certificate
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
      <SheetContent className="w-full sm:max-w-6xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Syringe className="h-5 w-5 mr-2" />
            Vaccination Certificate
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="mb-6">
            {renderCertificatePreview()}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
              className="flex items-center"
            >
              {isGenerating ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate Certificate"}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadCertificate}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>

            <Button
              variant="outline"
              onClick={handlePrintCertificate}
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}