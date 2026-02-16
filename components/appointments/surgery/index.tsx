import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import { CheckCircle, History, Calendar } from "lucide-react";
import { TabCompletionProvider, TabId, useTabCompletion } from "@/context/TabCompletionContext";
import { useGetPatientAppointmentHistory } from "@/queries/patients/get-patient-appointment-history";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";
import AppointmentHistoryNavigation from "../AppointmentHistoryNavigation";
import MedicalHistoryTab from "../MedicalHistoryTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import WeightGraph from "../WeightGraph";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { appointmentTabConfigMap } from "../appointmentTabConfig";
import DewormingComponent from "../deworming";
import VaccinationManagerComp from "../vaccination";
import VaccinationPlanning from "../vaccination/VaccinationPlanning";
import CertificateManagementWrapper from "../certification";

interface SurgeryComponentProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
  onAppointmentChange?: (newAppointmentId: string) => void;
}

function SurgeryContent({ patientId, appointmentId: initialAppointmentId, onClose, onAppointmentChange }: SurgeryComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("surgery-pre-op");
  const [weightGraphOpen, setWeightGraphOpen] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(initialAppointmentId);
  const { data: appointment } = useGetAppointmentById(currentAppointmentId);
  const { data: history } = useGetPatientAppointmentHistory(patientId);
  const { data: visitData, refetch: refetchVisitData } = useGetVisitByAppointmentId(currentAppointmentId);
  const [followUpDateFooter, setFollowUpDateFooter] = useState<string>("");
  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  // Keep currentAppointmentId in sync if parent prop changes
  useEffect(() => {
    setCurrentAppointmentId(initialAppointmentId);
  }, [initialAppointmentId]);

  // Get tab completion state
  const { isTabCompleted } = useTabCompletion();

  // Get the current tab configuration based on appointment type
  const currentTabConfig = useMemo(() => {
    const type = appointment?.appointmentType?.name || "Surgery";
    return appointmentTabConfigMap[type] || [];
  }, [appointment?.appointmentType?.name]);

  // Determine the appropriate provider based on appointment type
  const TabProvider = useMemo(() => {
    const type = appointment?.appointmentType?.name || "Surgery";
    switch (type) {
      case "deworming":
        return DewormingComponent;
      case "Surgery":
      default:
        return TabCompletionProvider;
    }
  }, [appointment?.appointmentType?.name]);

  // Initialize tab from URL parameter or default to first tab
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabId | null;
    if (tabFromUrl && currentTabConfig.some(tab => tab.value === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (currentTabConfig.length > 0 && appointment?.appointmentType?.name) {
      const defaultTab = currentTabConfig[0].value;
      setActiveTab(defaultTab);
      // Update URL if no valid tab in URL
      if (!tabFromUrl) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", defaultTab);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [currentTabConfig, appointment?.appointmentType?.name, searchParams, router]);

  // Update URL when tab changes (only when Visit Summary is already open)
  const handleTabChange = (value: string) => {
    const newTab = value as TabId;
    setActiveTab(newTab);
    // Only update URL if Visit Summary is open (this component is rendered)
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    params.set("appointmentId", currentAppointmentId); // Ensure appointmentId is also in URL
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Filter appointment history to exclude scheduled appointments
  const filteredAppointmentHistory = useMemo(() => {
    return history?.appointmentHistory.filter(appt => appt.status !== "scheduled") || [];
  }, [history?.appointmentHistory]);

  // Keep currentAppointmentId in sync if parent prop changes
  useEffect(() => {
    setCurrentAppointmentId(initialAppointmentId);
  }, [initialAppointmentId]);

  // When currentAppointmentId changes, refetch visit data
  useEffect(() => {
    refetchVisitData();
  }, [currentAppointmentId, refetchVisitData]);

  const isSurgeryTabCompleted = (tabValue: string): boolean => {
    if (!visitData) return false;

    const visit = visitData as any;
    const tabConfig = currentTabConfig.find(tab => tab.value === tabValue);

    if (!tabConfig || !tabConfig.isCompletedKey) {
      return false;
    }

    const isCompleted = Boolean(visit[tabConfig.isCompletedKey]);
    return isCompleted;
  };
  const navigateToNextTab = () => {
    if (!currentTabConfig) return;
    const currentIndex = currentTabConfig.findIndex(tab => tab.value === activeTab);
    if (currentIndex < currentTabConfig.length - 1) {
      setActiveTab(currentTabConfig[currentIndex + 1].value);
    }
  };

  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%]">
          <SheetHeader className="mb-6 mr-10">
            <div className="flex items-center justify-between">
              <SheetTitle>Surgery Visit</SheetTitle>
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
                  setCurrentAppointmentId(newAppointmentId);
                  // Reset to first tab when changing appointments, but preserve URL param if valid
                  if (currentTabConfig && currentTabConfig.length > 0) {
                    const tabFromUrl = searchParams.get("tab") as TabId | null;
                    const validTab = tabFromUrl && currentTabConfig.some(tab => tab.value === tabFromUrl)
                      ? tabFromUrl
                      : currentTabConfig[0].value;
                    setActiveTab(validTab);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("tab", validTab);
                    router.replace(`?${params.toString()}`, { scroll: false });
                  }
                }}
                selectedAppointmentType="Surgery"
              />
            </div>
          )}
          {(() => {
            const appointmentType = appointment?.appointmentType?.name?.toLowerCase();

            if (appointmentType === "vaccination" && currentTabConfig.length === 0) {
              return (
                <div className="p-4">
                  <VaccinationPlanning
                    patientId={patientId}
                    appointmentId={currentAppointmentId}
                    species={appointment?.patient?.species || "dog"}
                    onNext={() => { }}
                    onClose={onClose}
                    clinicId={appointment?.clinicId}
                    isReadOnly={appointment?.status === "completed"}
                    embedded={true}
                    hideMedicalHistoryButton={true}
                  />
                </div>
              );
            }

            if (appointmentType === "certification" || appointmentType === "certificate") {
              return (
                <div className="p-4">
                  <CertificateManagementWrapper
                    appointmentId={currentAppointmentId}
                    patientId={patientId}
                    onClose={onClose}
                    embedded={true}
                  />
                </div>
              );
            }

            return (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="w-full">
                  {currentTabConfig.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex items-center gap-1 text-lg font-bold ${isSurgeryTabCompleted(tab.value) ? 'data-[state=active]:text-green-600' : ''
                        }`}
                    >
                      <span className="flex items-center gap-1">
                        {tab.label}
                        {isSurgeryTabCompleted(tab.value) && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-1" />
                        )}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {currentTabConfig?.map((tab: any) => {
                  const TabComponent = tab.component;
                  return (
                    <TabsContent key={tab.value} value={tab.value}>
                      <TabComponent
                        patientId={patientId}
                        appointmentId={currentAppointmentId}
                        visitId={visitData?.id}
                        onNext={navigateToNextTab}
                        onClose={onClose}
                        externalFollowUpDate={followUpDateFooter}
                        onExternalFollowUpDateChange={setFollowUpDateFooter}
                        setWeightGraphOpen={tab.value === "surgery-pre-op" ? setWeightGraphOpen : undefined}
                      />
                    </TabsContent>
                  );
                })}
              </Tabs>
            );
          })()}
          {activeTab === "surgery-discharge" && appointment?.appointmentType?.name === "Surgery" && (
            <div className="border-t border-gray-200 p-4">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={followUpDateFooter ? new Date(followUpDateFooter) : null}
                      onChange={(date) => {
                        if (date instanceof Date && !isNaN(date.getTime())) {
                          setFollowUpDateFooter(date.toISOString());
                        } else {
                          setFollowUpDateFooter("");
                        }
                      }}
                      minDate={today}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      dateFormat="dd/MM/yyyy"
                      placeholderText="dd/mm/yyyy"
                      className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <Button
                  onClick={() => setShowNewAppointment(true)}
                  className="theme-button text-white"
                >
                  Book Another Appointment
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Medical History Sheet */}
      <Sheet open={showMedicalHistory} onOpenChange={setShowMedicalHistory}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Medical History</SheetTitle>
          </SheetHeader>

          <MedicalHistoryTab
            patientId={patientId}
            appointmentId={currentAppointmentId}
            onNext={() => setShowMedicalHistory(false)}
          />

        </SheetContent>
      </Sheet>

      <Dialog open={weightGraphOpen} onOpenChange={setWeightGraphOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Weight History</DialogTitle>
            <DialogDescription>
              View the patient's weight history over time
            </DialogDescription>
          </DialogHeader>
          <WeightGraph
            patientId={patientId}
            isOpen={weightGraphOpen}
            onClose={() => setWeightGraphOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SurgeryComponent(props: SurgeryComponentProps) {
  return (
    <TabCompletionProvider>
      <SurgeryContent {...props} />
    </TabCompletionProvider>
  );
}