"use client"
import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new"
import { Button } from "@/components/ui/button"
import { CheckCircle, History } from "lucide-react"
import { useTabCompletion, type TabId, TabCompletionProvider } from "@/context/TabCompletionContext"
import { useGetPatientAppointmentHistory } from "@/queries/patients/get-patient-appointment-history"
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"
import { appointmentTabConfigMap } from "../appointmentTabConfig"
import AppointmentHistoryNavigation from "../AppointmentHistoryNavigation"
import MedicalHistoryTab from "../MedicalHistoryTab"
import VaccinationPlanning from "../vaccination/VaccinationPlanning"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog"
import WeightGraph from "../WeightGraph"
import { DialogHeader } from "@/components/ui/dialog"
import CertificateManagementWrapper from "../certification"

interface DewormingComponentProps {
  patientId: string
  appointmentId: string
  onClose: () => void
  onAppointmentChange?: (newAppointmentId: string) => void
}

function DewormingContent({
  patientId,
  appointmentId: initialAppointmentId,
  onClose,
  onAppointmentChange,
}: DewormingComponentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>("deworming-intake")
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false)
  const [currentAppointmentId, setCurrentAppointmentId] = useState(initialAppointmentId)
  const [followUpDateFooter, setFollowUpDateFooter] = useState<string>("")

  const { data: history } = useGetPatientAppointmentHistory(patientId)
  const { data: appointment } = useGetAppointmentById(currentAppointmentId)
  const { data: visitData, refetch: refetchVisitData } = useGetVisitByAppointmentId(currentAppointmentId)
  const [weightGraphOpen, setWeightGraphOpen] = useState(false)

  // Get tab completion state
  const { isTabCompleted } = useTabCompletion()

  // Get the current tab configuration based on appointment type
  const currentTabConfig = useMemo(() => {
    const type = appointment?.appointmentType?.name || "Deworming"
    const config = appointmentTabConfigMap[type] || appointmentTabConfigMap["Deworming"] || []
    return config
  }, [appointment?.appointmentType?.name])

  // Initialize tab from URL parameter or default to first tab
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabId | null
    if (tabFromUrl && currentTabConfig.some((tab) => tab.value === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    } else if (currentTabConfig.length > 0 && appointment?.appointmentType?.name) {
      const defaultTab = currentTabConfig[0].value
      setActiveTab(defaultTab)
      // Update URL if no valid tab in URL
      if (!tabFromUrl) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", defaultTab)
        router.replace(`?${params.toString()}`, { scroll: false })
      }
    }
  }, [currentTabConfig, appointment?.appointmentType?.name, searchParams, router])

  // Update URL when tab changes (only when Visit Summary is already open)
  const handleTabChange = (value: string) => {
    const newTab = value as TabId
    setActiveTab(newTab)
    // Only update URL if Visit Summary is open (this component is rendered)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", newTab)
    params.set("appointmentId", currentAppointmentId) // Ensure appointmentId is also in URL
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Filter appointment history to only include InProgress or completed appointments of type Deworming
  const filteredAppointmentHistory = useMemo(() => {
    return history?.appointmentHistory.filter((appt) => 
      (appt.status === "InProgress" || 
       appt.status === "completed") &&
      appt.appointmentType === "Deworming"
    ) || []
  }, [history?.appointmentHistory])

  // Keep currentAppointmentId in sync if parent prop changes
  useEffect(() => {
    setCurrentAppointmentId(initialAppointmentId)
  }, [initialAppointmentId])

  // When currentAppointmentId changes, refetch visit data
  useEffect(() => {
    refetchVisitData()
  }, [currentAppointmentId, refetchVisitData])

  const isDewormingTabCompleted = (tabValue: string): boolean => {
    // First check TabCompletionContext for immediate state
    const contextCompleted = isTabCompleted(tabValue as TabId);
    if (contextCompleted) return true;
    
    // Fall back to database state
    if (!visitData) return false
    const visit = visitData as any
    const tabConfig = currentTabConfig.find((tab) => tab.value === tabValue)

    if (!tabConfig || !tabConfig.isCompletedKey) {
      return false
    }
    const isCompleted = Boolean(visit[tabConfig.isCompletedKey])
    return isCompleted
  }

  const navigateToNextTab = () => {
    if (!currentTabConfig) return
    const currentIndex = currentTabConfig.findIndex((tab) => tab.value === activeTab)
    if (currentIndex < currentTabConfig.length - 1) {
      setActiveTab(currentTabConfig[currentIndex + 1].value)
    }
  }

  const handleCloseAndClearUrl = () => {
    const params = new URLSearchParams(searchParams.toString())

    // remove tab & appointmentId
    params.delete("tab")
    params.delete("appointmentId")

    router.replace(`?${params.toString()}`, { scroll: false })

    onClose()
  }

  return (
    <>
      <Sheet open={true} onOpenChange={handleCloseAndClearUrl}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%]">
          <SheetHeader className="mb-6 mr-10">
            <div className="flex items-center justify-between">
              <SheetTitle>Deworming Visit</SheetTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMedicalHistory(true)}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Medical History
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Appointment History Navigation */}
          {filteredAppointmentHistory.length > 0 && (
            <div className="mb-4">
              <AppointmentHistoryNavigation
                patientHistory={filteredAppointmentHistory}
                currentAppointmentId={currentAppointmentId}
                onAppointmentSelect={(newAppointmentId) => {
                  setCurrentAppointmentId(newAppointmentId)
                  // Reset to first tab when changing appointments, but preserve URL param if valid
                  if (currentTabConfig && currentTabConfig.length > 0) {
                    const tabFromUrl = searchParams.get("tab") as TabId | null
                    const validTab =
                      tabFromUrl && currentTabConfig.some((tab) => tab.value === tabFromUrl)
                        ? tabFromUrl
                        : currentTabConfig[0].value
                    setActiveTab(validTab)
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("tab", validTab)
                    router.replace(`?${params.toString()}`, { scroll: false })
                  }
                }}
                selectedAppointmentType="Deworming"
              />
            </div>
          )}

          {/* Main Content */}
          {(() => {
            const appointmentType = appointment?.appointmentType?.name?.toLowerCase()

            // Only show vaccination in embedded mode if explicitly set
            if (appointmentType === "vaccination" && currentTabConfig.length === 0) {
              return (
                <div className="p-4">
                  <VaccinationPlanning
                    patientId={patientId}
                    appointmentId={currentAppointmentId}
                    species={appointment?.patient?.species || "dog"}
                    onNext={() => {}}
                    onClose={onClose}
                    clinicId={appointment?.clinicId}
                    isReadOnly={appointment?.status === "completed"}
                    embedded={true}
                    hideMedicalHistoryButton={true}
                  />
                </div>
              )
            }

            // Handle certification appointments
            if (appointmentType === "certification" || appointmentType === "certificate") {
              return (
                <div className="p-4">
                  <CertificateManagementWrapper
                    appointmentId={currentAppointmentId}
                    patientId={patientId}
                    onClose={handleCloseAndClearUrl}
                    embedded={true}
                  />
                </div>
              )
            }

            // For deworming or any other type, show the tabs

            // Default case - show tabs
            return (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="w-full">
                  {currentTabConfig.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex items-center gap-1 text-lg font-bold ${
                        isDewormingTabCompleted(tab.value) ? "data-[state=active]:text-green-600" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {tab.label}
                        {isDewormingTabCompleted(tab.value) && <CheckCircle className="h-4 w-4 text-green-600 ml-1" />}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {currentTabConfig.map((tab: any) => {
                  const TabComponent = tab.component
                  return (
                    <TabsContent key={tab.value} value={tab.value} className="mt-0">
                      <TabCompletionProvider>
                        <TabComponent
                          patientId={patientId}
                          appointmentId={currentAppointmentId}
                          visitId={visitData?.id}
                          onNext={navigateToNextTab}
                          onClose={handleCloseAndClearUrl}
                          externalFollowUpDate={followUpDateFooter}
                          onExternalFollowUpDateChange={setFollowUpDateFooter}
                          setWeightGraphOpen={tab.value === "deworming-intake" ? setWeightGraphOpen : undefined}
                        />
                      </TabCompletionProvider>
                    </TabsContent>
                  )
                })}
              </Tabs>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Medical History Sheet */}
      <Sheet open={showMedicalHistory} onOpenChange={setShowMedicalHistory}>
        <SheetContent
          side="right"
          className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>Medical History</SheetTitle>
          </SheetHeader>
          <TabCompletionProvider>
            <MedicalHistoryTab
              patientId={patientId}
              appointmentId={currentAppointmentId}
              onNext={() => setShowMedicalHistory(false)}
            />
          </TabCompletionProvider>
        </SheetContent>
      </Sheet>

      <Dialog open={weightGraphOpen} onOpenChange={setWeightGraphOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Weight History</DialogTitle>
            <DialogDescription>View the patient's weight history over time</DialogDescription>
          </DialogHeader>
          <WeightGraph patientId={patientId} isOpen={weightGraphOpen} onClose={() => setWeightGraphOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

// Main export with TabCompletionProvider
export default function DewormingComponent(props: DewormingComponentProps) {
  return (
    <TabCompletionProvider>
      <DewormingContent {...props} />
    </TabCompletionProvider>
  )
}