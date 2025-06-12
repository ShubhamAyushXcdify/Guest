"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new"
import { Button } from "@/components/ui/button"
import IntakeTab from "./IntakeTab"
import ComplaintsTab from "./ComplaintsTab"
import MedicalHistoryTab from "./MedicalHistoryTab"
import VitalsTab from "./VitalsTab"
import ProcedureTab from "./ProcedureTab"
import AssessmentTab from "./AssessmentTab"
import PlanTab from "./PlanTab"
import { ArrowRight } from "lucide-react"

interface PatientInformationProps {
  patientId: string
  appointmentId: string
  onClose: () => void
}

export default function PatientInformation({ patientId, appointmentId, onClose }: PatientInformationProps) {
  const [activeTab, setActiveTab] = useState("intake")

  // Define tab navigation functions
  const navigateToNextTab = () => {
    const tabOrder = ["intake", "cc-hpi", "medical-history", "vitals", "procedure", "assessment", "plan"];
    const currentIndex = tabOrder.indexOf(activeTab);
    
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[80%] lg:!max-w-[80%] overflow-x-hidden overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Patient Information</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="intake">Intake</TabsTrigger>
            <TabsTrigger value="cc-hpi">Complaints</TabsTrigger>
            <TabsTrigger value="medical-history">Medical History</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="procedure">Procedure</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          {/* Intake Tab */}
          <TabsContent value="intake">
            <IntakeTab 
              patientId={patientId} 
              appointmentId={appointmentId} 
              onNext={navigateToNextTab} 
            />
          </TabsContent>

          {/* CC & HPI Tab */}
          <TabsContent value="cc-hpi">
            <ComplaintsTab patientId={patientId} appointmentId={appointmentId} onNext={navigateToNextTab} />
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical-history">
            <MedicalHistoryTab patientId={patientId} appointmentId={appointmentId} onNext={navigateToNextTab} />
          </TabsContent>

          {/* Vitals Tab */}
          <TabsContent value="vitals">
            <VitalsTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>

          {/* Procedure Tab */}
          <TabsContent value="procedure">
            <ProcedureTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment">
            <AssessmentTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan">
            <PlanTab patientId={patientId} appointmentId={appointmentId} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          <Button onClick={navigateToNextTab} className="flex items-center gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
} 