interface SurgeryTabsProps extends SurgeryComponentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateToNextTab: () => void;
}

function SurgeryTabs({ patientId, appointmentId, onClose, activeTab, setActiveTab, navigateToNextTab }: SurgeryTabsProps) {
  const { isTabCompleted } = useSurgeryTabCompletion();
  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);

  function shouldShowTabAsCompleted(tabId: string) {
    if (!visitData) return false;
    const visit: any = visitData;
    switch(tabId) {
      case "pre-op":
        return visit.isSurgeryPreOpCompleted === true;
      case "surgery":
        return visit.isSurgeryDetailsCompleted === true;
      case "post-op":
        return visit.isSurgeryPostOpCompleted === true;
      case "prescription":
        return visit.isPrescriptionCompleted === true;
      case "discharge":
        return visit.isSurgeryDischargeCompleted === true;
      default:
        return false;
    }
  }

  const [showNewAppointment, setShowNewAppointment] = useState(false)
  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabOrder.map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted(tab.id) ? "text-green-600 border-b-2 border-green-600" : ""}`}
            >
              {tab.label}
              {shouldShowTabAsCompleted(tab.id) && (
                <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="pre-op">
          <PreOpTab patientId={patientId} appointmentId={appointmentId} />
        </TabsContent>
        <TabsContent value="surgery">
          <SurgeryTab patientId={patientId} appointmentId={appointmentId} />
        </TabsContent>
        <TabsContent value="post-op">
          <PostOpTab patientId={patientId} appointmentId={appointmentId} />
        </TabsContent>
       <TabsContent value="prescription">
          <TabCompletionProvider>
            <PrescriptionTab patientId={patientId} appointmentId={appointmentId} />
          </TabCompletionProvider>
       </TabsContent>

        <TabsContent value="discharge">
          <DischargeTab patientId={patientId} appointmentId={appointmentId} onClose={onClose} />
        </TabsContent>
      </Tabs>
      <div className="mt-4 flex justify-end">
        {activeTab !== "discharge" ? (
          <Button onClick={navigateToNextTab}>Next</Button>
        ) : (
          <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowNewAppointment(true)}
                className="theme-button text-white"
              >
                Book Another Appointment
              </Button>
            </div>
        )}
         <NewAppointment 
        isOpen={showNewAppointment} 
        onClose={() => setShowNewAppointment(false)}
        patientId={patientId}
        />
      </div>
    </>
  );
}
import React, { useState, createContext, useContext, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import PreOpTab from "./PreOpTab";
import SurgeryTab from "./SurgeryTab";
import PostOpTab from "./PostOpTab";
import DischargeTab from "./DischargeTab";
import { CheckCircle, History } from "lucide-react";
import NewAppointment from "../newAppointment";
import MedicalHistoryTab from "../MedicalHistoryTab";
import { TabCompletionProvider } from "@/context/TabCompletionContext";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import PrescriptionTab from "../Patient-Information/PrescriptionTab";

interface SurgeryComponentProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const tabOrder = [
  { id: "pre-op", label: "Pre-op" },
  { id: "surgery", label: "Surgery" },
  { id: "post-op", label: "Post-op" },
  { id: "prescription", label: "Prescription" },
  { id: "discharge", label: "Discharge" },
];

// Surgery tab completion context
const SurgeryTabCompletionContext = createContext<any>(null);

function SurgeryTabCompletionProvider({ children, patientId, appointmentId }: { children: React.ReactNode, patientId: string, appointmentId: string }) {
  const STORAGE_KEY = `surgeryTabsCompleted-${patientId}-${appointmentId}`;
  const [completedTabs, setCompletedTabs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTabs));
    }
  }, [completedTabs, STORAGE_KEY]);

  const markTabAsCompleted = (tabId: string) => {
    setCompletedTabs(prev => (prev.includes(tabId) ? prev : [...prev, tabId]));
  };
  const isTabCompleted = (tabId: string) => completedTabs.includes(tabId);

  return (
    <SurgeryTabCompletionContext.Provider value={{ completedTabs, markTabAsCompleted, isTabCompleted }}>
      {children}
    </SurgeryTabCompletionContext.Provider>
  );
}

function useSurgeryTabCompletion() {
  const ctx = useContext(SurgeryTabCompletionContext);
  if (!ctx) throw new Error("useSurgeryTabCompletion must be used within SurgeryTabCompletionProvider");
  return ctx;
}

export { useSurgeryTabCompletion };

export default function SurgeryComponent({ patientId, appointmentId, onClose }: SurgeryComponentProps) {
  const [activeTab, setActiveTab] = useState(tabOrder[0].id);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);

  const navigateToNextTab = () => {
    const currentIndex = tabOrder.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1].id);
    }
  };

  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
          <SheetHeader className="mb-6 mr-10">
            <div className="flex items-center justify-between">
              <SheetTitle>Surgery Visit</SheetTitle>
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
          </SheetHeader>
          <SurgeryTabCompletionProvider patientId={patientId} appointmentId={appointmentId}>
            <SurgeryTabs
              patientId={patientId}
              appointmentId={appointmentId}
              onClose={onClose}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navigateToNextTab={navigateToNextTab}
            />
          </SurgeryTabCompletionProvider>
        </SheetContent>
      </Sheet>

      {/* Medical History Sheet */}
      <Sheet open={showMedicalHistory} onOpenChange={setShowMedicalHistory}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Medical History</SheetTitle>
          </SheetHeader>
          <TabCompletionProvider>
            <MedicalHistoryTab 
              patientId={patientId} 
              appointmentId={appointmentId} 
              onNext={() => setShowMedicalHistory(false)} 
            />
          </TabCompletionProvider>
        </SheetContent>
      </Sheet>
    </>
  );
}