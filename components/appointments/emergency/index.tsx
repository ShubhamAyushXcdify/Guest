import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import TriageTab from "./TriageTab";
import EmergencyVitalsTab from "./EmergencyVitalsTab";
import EmergencyProceduresTab from "./EmergencyProceduresTab";
import DischargeTab from "./DischargeTab";

interface EmergencyComponentProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const tabOrder = [
  { id: "triage", label: "Triage" },
  { id: "emergency-vitals", label: "Emergency Vitals" },
  { id: "emergency-procedures", label: "Emergency Procedures" },
  { id: "discharge", label: "Discharge" },
];

export default function EmergencyComponent({ patientId, appointmentId, onClose }: EmergencyComponentProps) {
  const [activeTab, setActiveTab] = useState(tabOrder[0].id);

  // Placeholder completion logic (replace with real logic later)
  const isTabCompleted = (tabId: string) => false;

  const navigateToNextTab = () => {
    const currentIndex = tabOrder.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1].id);
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[70%] lg:!max-w-[70%] overflow-x-hidden overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Emergency Visit
          </SheetTitle>
        </SheetHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            {tabOrder.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center gap-1 ${isTabCompleted(tab.id) ? "text-green-600" : ""}`}
              >
                {tab.label}
                {isTabCompleted(tab.id) && <CheckCircle className="h-3 w-3 text-green-600" />}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="triage">
            <TriageTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>

          <TabsContent value="emergency-vitals">
            <EmergencyVitalsTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>

          <TabsContent value="emergency-procedures">
            <EmergencyProceduresTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>

          <TabsContent value="discharge">
            <DischargeTab patientId={patientId} appointmentId={appointmentId} onClose={onClose} />
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end space-x-4">
          {activeTab !== "discharge" && (
            <Button onClick={navigateToNextTab} className="flex items-center gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {activeTab === "discharge" && (
            <Button onClick={onClose} className="theme-button text-white">
              Close
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 