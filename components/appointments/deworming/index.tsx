import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import IntakeTab from "./IntakeTab";
import MedicationTab from "./MedicationTab";
import NotesTab from "./NotesTab";
import CheckoutTab from "./CheckoutTab";


interface DewormingComponentProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const tabOrder = [
  { id: "intake", label: "Intake" },
  { id: "medication", label: "Medication" },
  { id: "notes", label: "Notes" },
  { id: "checkout", label: "Checkout" },
];

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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabOrder.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
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
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}