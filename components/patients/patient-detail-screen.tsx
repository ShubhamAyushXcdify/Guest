"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Edit, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import PatientOverview from "@/components/patients/patient-overview"
//import PatientMedical from "@/components/patients/patient-medical"
import PatientVisits from "@/components/patients/patient-visits"
import PatientLabResults from "@/components/patients/patient-lab-results"
import PatientPrescriptions from "@/components/patients/patient-prescriptions"
import PatientBilling from "@/components/patients/patient-billing"
import PatientFiles from "@/components/patients/patient-files"
import { useGetPatientById } from "@/queries/patients/get-patients-by-id"
import { formatDate } from "@/lib/utils"

export const PatientDetailScreen = () => {
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string
  
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)

  // Ensure we only access localStorage on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: patient, isLoading, isError } = useGetPatientById(patientId)

  // Handle navigation back to patients list
  const handleBack = () => {
    router.push("/patients")
  }

  // Handle navigation to edit patient
  const handleEdit = () => {
    router.push(`/patients/${patientId}/edit`)
  }

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading patient details. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>

      {/* Patient Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="relative mr-6">
              <Avatar className="h-24 w-24 bg-gray-200 dark:bg-slate-700">
                <AvatarFallback className="text-gray-400 dark:text-gray-500 text-lg">
                  {patient.name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mr-2">{patient.name}</h1>
                <span className="text-gray-500 dark:text-gray-400">#{patient.id.substring(0, 8)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Species: </span>
                  <span className="text-gray-900 dark:text-white">{patient.species}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Age: </span>
                  <span className="text-gray-900 dark:text-white">
                    {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Unknown"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Weight: </span>
                  <span className="text-gray-900 dark:text-white">{patient.weightKg}kg</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Breed: </span>
                  <span className="text-gray-900 dark:text-white">{patient.breed}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Sex: </span>
                  <span className="text-gray-900 dark:text-white">
                    {patient.gender} {patient.isNeutered ? "(Neutered)" : ""}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Microchip: </span>
                  <span className="text-gray-900 dark:text-white">{patient.microchipNumber || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center ml-auto space-x-4">
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-0 h-auto w-full justify-start rounded-none mb-6">
      <TabsTrigger
        value="overview"
        className={`px-6 py-3 rounded-none border-b-2 ${
          activeTab === "overview"
            ? "border-theme-primary text-theme-primary dark:text-white"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }`}
      >
    Overview
  </TabsTrigger>
  {/* <TabsTrigger
    value="medical"
    className={`px-6 py-3 rounded-none border-b-2 ${
      activeTab === "medical"
        ? "border-theme-primary text-theme-primary dark:text-white"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    }`}
  >
    Medical
  </TabsTrigger> */}
  <TabsTrigger
    value="visits"
    className={`px-6 py-3 rounded-none border-b-2 ${
      activeTab === "visits"
        ? "border-theme-primary text-theme-primary dark:text-white"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    }`}
  >
    Visits
  </TabsTrigger>
  {/* <TabsTrigger
    value="lab-results"
    className={`px-6 py-3 rounded-none border-b-2 ${
      activeTab === "lab-results"
        ? "border-theme-primary text-theme-primary dark:text-white"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    }`}
  >
    Lab Results
  </TabsTrigger> */}
  <TabsTrigger
    value="prescriptions"
    className={`px-6 py-3 rounded-none border-b-2 ${
      activeTab === "prescriptions"
        ? "border-theme-primary text-theme-primary dark:text-white"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    }`}
  >
    Prescriptions
  </TabsTrigger>
  {/* <TabsTrigger
    value="billing"
    className={`px-6 py-3 rounded-none border-b-2 ${
      activeTab === "billing"
        ? "border-theme-primary text-theme-primary dark:text-white"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    }`}
  >
    Billing
  </TabsTrigger>
  <TabsTrigger
    value="files"
    className={`px-6 py-3 rounded-none border-b-2 ${
      activeTab === "files"
        ? "border-theme-primary text-theme-primary dark:text-white"
        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
    }`}
  >
    Files
  </TabsTrigger> */}
</TabsList>

<TabsContent value="overview">
  <PatientOverview patient={patient} patientId={patientId} />
</TabsContent>
{/* <TabsContent value="medical">
  <PatientMedical />
</TabsContent> */}
<TabsContent value="visits">
  <PatientVisits />
</TabsContent>
{/* <TabsContent value="lab-results">
  <PatientLabResults />
</TabsContent> */}
<TabsContent value="prescriptions">
  <PatientPrescriptions />
</TabsContent>
{/* <TabsContent value="billing">
  <PatientBilling />
</TabsContent>
<TabsContent value="files">
  <PatientFiles />
</TabsContent> */}

      </Tabs>
    </div>
  )
} 