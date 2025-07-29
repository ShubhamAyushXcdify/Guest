import React, { useState, createContext, useContext, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import IntakeTab from "./IntakeTab";
import MedicationTab from "./MedicationTab";
import CheckoutTab from "./CheckoutTab";
import NotesTab from "./NotesTab";
import NewAppointment from "../newAppointment";

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

  function shouldShowTabAsCompleted(tabId: string) {
    if (!visitData) return false;
    switch (tabId) {
      case "intake":
        return visitData.isDewormingIntakeCompleted === true;
      case "medication":
        return visitData.isDewormingMedicationCompleted === true;
      case "notes":
        return visitData.isDewormingNotesCompleted === true;
      case "checkout":
        return visitData.isDewormingCheckoutCompleted === true;
      default:
        return false;
    }
  }

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

        <TabsContent value="intake">
          <IntakeTab patientId={patientId} appointmentId={appointmentId} />
        </TabsContent>
        <TabsContent value="medication">
          <MedicationTab patientId={patientId} appointmentId={appointmentId} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab patientId={patientId} appointmentId={appointmentId} />
        </TabsContent>
        <TabsContent value="checkout">
          <CheckoutTab patientId={patientId} appointmentId={appointmentId} onClose={onClose} />
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex justify-end">
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
    </>
  );
}

export default function DewormingComponent({ patientId, appointmentId, onClose }: DewormingComponentProps) {
  const [activeTab, setActiveTab] = useState(tabOrder[0].id);

  const navigateToNextTab = () => {
    const currentIndex = tabOrder.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1].id);
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Deworming Visit</SheetTitle>
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
  );
}

export { useDewormingTabCompletion };
