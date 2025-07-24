import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs-new";
import { Button } from "@/components/ui/button";
import PreOpTab from "./PreOpTab";
import SurgeryTab from "./SurgeryTab";
import PostOpTab from "./PostOpTab";
import DischargeTab from "./DischargeTab";

interface SurgeryComponentProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const tabOrder = [
  { id: "pre-op", label: "Pre-op" },
  { id: "surgery", label: "Surgery" },
  { id: "post-op", label: "Post-op" },
  { id: "discharge", label: "Discharge" },
];

export default function SurgeryComponent({ patientId, appointmentId, onClose }: SurgeryComponentProps) {
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
          <SheetTitle>Surgery Visit</SheetTitle>
        </SheetHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabOrder.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
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
          <TabsContent value="discharge">
            <DischargeTab patientId={patientId} appointmentId={appointmentId} onClose={onClose} />
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-end">
          {activeTab !== "discharge" ? (
            <Button onClick={navigateToNextTab}>Next</Button>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 