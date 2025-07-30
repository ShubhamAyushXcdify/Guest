import React, { useState, createContext, useContext, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import { CheckCircle, History } from "lucide-react";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import IntakeTab from "./IntakeTab";
import MedicationTab from "./MedicationTab";
import CheckoutTab from "./CheckoutTab";
import NotesTab from "./NotesTab";
import NewAppointment from "../newAppointment";
import MedicalHistoryTab from "../MedicalHistoryTab";
import { TabCompletionProvider } from "@/context/TabCompletionContext";

interface DewormingComponentProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const tabOrder = [
  { id: "intake", label: "Intake" },
  { id: "medication", label: "Medication" },
  { id: "notes", label: "Notes" },
  { id: "checkout", label: "Checkout" }
];

// Context
const DewormingTabCompletionContext = createContext<any>(null);

function DewormingTabCompletionProvider({ children, patientId, appointmentId }: { children: React.ReactNode; patientId: string; appointmentId: string }) {
  const STORAGE_KEY = `dewormingTabsCompleted-${patientId}-${appointmentId}`;
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
    <DewormingTabCompletionContext.Provider value={{ markTabAsCompleted, isTabCompleted }}>
      {children}
    </DewormingTabCompletionContext.Provider>
  );
}

function useDewormingTabCompletion() {
  const ctx = useContext(DewormingTabCompletionContext);
  if (!ctx) throw new Error("useDewormingTabCompletion must be used within DewormingTabCompletionProvider");
  return ctx;
}

function DewormingTabs({
  patientId,
  appointmentId,
  activeTab,
  setActiveTab,
  navigateToNextTab,
  onClose
}: {
  patientId: string;
  appointmentId: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigateToNextTab: () => void;
  onClose: () => void;
}) {
  const { isTabCompleted, markTabAsCompleted } = useDewormingTabCompletion();
  const { data: visitData, refetch: refetchVisit } = useGetVisitByAppointmentId(appointmentId);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);

  // Get the actual visitId from visit data
  const visitId = visitData?.id;

  // Refetch data when tab becomes active
  useEffect(() => {
    refetchVisit();
  }, [activeTab, refetchVisit]);

  // Mark tabs as completed in local storage when backend says so
  useEffect(() => {
    if (!visitData) return;
    if (visitData.isDewormingIntakeCompleted) markTabAsCompleted("intake");
    if (visitData.isDewormingMedicationCompleted) markTabAsCompleted("medication");
    if (visitData.isDewormingNotesCompleted) markTabAsCompleted("notes");
    if (visitData.isDewormingCheckoutCompleted) markTabAsCompleted("checkout");
  }, [visitData, markTabAsCompleted]);

  // Function to determine if a tab should appear completed/green based on visit data
  function shouldShowTabAsCompleted(tabId: string) {
    if (!visitData) {
      return false;
    }
    
    let result = false;
    switch (tabId) {
      case "intake":
        result = visitData.isDewormingIntakeCompleted || false;
        break;
      case "medication":
        result = visitData.isDewormingMedicationCompleted || false;
        break;
      case "notes":
        result = visitData.isDewormingNotesCompleted || false;
        break;
      case "checkout":
        result = visitData.isDewormingCheckoutCompleted || false;
        break;
      default:
        result = false;
    }
    
    return result;
  }

  // Check if all tabs are completed
  const allTabsCompleted = !!(visitData && 
    visitData.isDewormingIntakeCompleted && 
    visitData.isDewormingMedicationCompleted && 
    visitData.isDewormingNotesCompleted);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          {/* Customize each TabsTrigger to show completion status */}
          <TabsTrigger 
            value="intake" 
            className={`flex items-center gap-1 ${shouldShowTabAsCompleted("intake") ? "text-green-600" : ""}`}
          >
            Intake
            {shouldShowTabAsCompleted("intake") && <CheckCircle className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger 
            value="medication"
            className={`flex items-center gap-1 ${shouldShowTabAsCompleted("medication") ? "text-green-600" : ""}`}
          >
            Medication
            {shouldShowTabAsCompleted("medication") && <CheckCircle className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger 
            value="notes"
            className={`flex items-center gap-1 ${shouldShowTabAsCompleted("notes") ? "text-green-600" : ""}`}
          >
            Notes
            {shouldShowTabAsCompleted("notes") && <CheckCircle className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger 
            value="checkout"
            className={`flex items-center gap-1 ${shouldShowTabAsCompleted("checkout") ? "text-green-600" : ""}`}
          >
            Checkout
            {shouldShowTabAsCompleted("checkout") && <CheckCircle className="h-3 w-3 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intake">
          <IntakeTab 
            patientId={patientId} 
            appointmentId={appointmentId}
            visitId={visitId}
            onComplete={(completed) => {
              if (completed) markTabAsCompleted("intake");
            }}
            onNext={navigateToNextTab}
            isCompleted={shouldShowTabAsCompleted("intake")}
          />
        </TabsContent>
        <TabsContent value="medication">
          <MedicationTab 
            patientId={patientId} 
            appointmentId={appointmentId}
            visitId={visitId}
            onComplete={(completed) => {
              if (completed) markTabAsCompleted("medication");
            }}
            onNext={navigateToNextTab}
            isCompleted={shouldShowTabAsCompleted("medication")}
          />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab 
            patientId={patientId} 
            appointmentId={appointmentId}
            visitId={visitId}
            onComplete={(completed) => {
              if (completed) markTabAsCompleted("notes");
            }}
            onNext={navigateToNextTab}
            isCompleted={shouldShowTabAsCompleted("notes")}
          />
        </TabsContent>
        <TabsContent value="checkout">
          <CheckoutTab 
            patientId={patientId} 
            appointmentId={appointmentId}
            visitId={visitId}
            onClose={onClose}
            onComplete={(completed) => {
              if (completed) markTabAsCompleted("checkout");
            }}
            allTabsCompleted={allTabsCompleted}
            isCompleted={shouldShowTabAsCompleted("checkout")}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        {activeTab !== "checkout" ? (
          <Button onClick={navigateToNextTab}>Next</Button>
        ) : (
          <Button className="theme-button" onClick={() => setShowNewAppointment(true)}>
            Book Another Appointment
          </Button>
        )}
      </div>

      <NewAppointment
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        patientId={patientId}
      />

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

export default function DewormingComponent({ patientId, appointmentId, onClose }: DewormingComponentProps) {
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
              <SheetTitle>Deworming Visit</SheetTitle>
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
          <DewormingTabCompletionProvider patientId={patientId} appointmentId={appointmentId}>
            <DewormingTabs
              patientId={patientId}
              appointmentId={appointmentId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              navigateToNextTab={navigateToNextTab}
              onClose={onClose}
            />
          </DewormingTabCompletionProvider>
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

export { useDewormingTabCompletion };
