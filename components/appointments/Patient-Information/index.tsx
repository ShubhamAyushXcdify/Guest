"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new"
import { Button } from "@/components/ui/button"
import IntakeTab from "./IntakeTab"
import ComplaintsTab from "./ComplaintsTab"
import MedicalHistoryTab from "./MedicalHistoryTab"
import VitalsTab from "./VitalsTab"
import ProcedureTab from "./ProcedureTab"
import AssessmentTab from "./PrescriptionTab"
import PlanTab from "./PlanTab"
import { ArrowRight, CheckCircle } from "lucide-react"
import NewAppointment from "../newAppointment"
import { TabCompletionProvider, useTabCompletion, TabId } from "@/context/TabCompletionContext"
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id"

interface PatientInformationProps {
  patientId: string
  appointmentId: string
  onClose: () => void
}

// Create a wrapper for the component content
function PatientInformationContent({ patientId, appointmentId, onClose }: PatientInformationProps) {
  const [activeTab, setActiveTab] = useState("intake")
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const { isTabCompleted } = useTabCompletion()
  const { data: appointment } = useGetAppointmentById(appointmentId)
  const isCompleted = appointment?.status?.toLowerCase() === "completed"

  // Define tab navigation functions
  const navigateToNextTab = () => {
    const tabOrder = ["intake", "cc-hpi", "medical-history", "vitals", "procedure", "assessment", "plan"];
    const currentIndex = tabOrder.indexOf(activeTab);
    
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  // Function to determine if a tab should appear completed/green
  const shouldShowTabAsCompleted = (tabId: TabId) => {
    return isCompleted || isTabCompleted(tabId);
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[80%] lg:!max-w-[80%] overflow-x-hidden overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Patient Information</SheetTitle>
        </SheetHeader>

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
              value="cc-hpi"
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted("cc-hpi") ? "text-green-600" : ""}`}
            >
              Complaints
              {shouldShowTabAsCompleted("cc-hpi") && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger 
              value="medical-history"
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted("medical-history") ? "text-green-600" : ""}`}
            >
              Medical History
              {shouldShowTabAsCompleted("medical-history") && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger 
              value="vitals"
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted("vitals") ? "text-green-600" : ""}`}
            >
              Vitals
              {shouldShowTabAsCompleted("vitals") && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger 
              value="procedure"
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted("procedure") ? "text-green-600" : ""}`}
            >
              Procedure
              {shouldShowTabAsCompleted("procedure") && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger 
              value="assessment"
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted("assessment") ? "text-green-600" : ""}`}
            >
              Prescription
              {shouldShowTabAsCompleted("assessment") && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger 
              value="plan"
              className={`flex items-center gap-1 ${shouldShowTabAsCompleted("plan") ? "text-green-600" : ""}`}
            >
              Plan
              {shouldShowTabAsCompleted("plan") && <CheckCircle className="h-3 w-3 text-green-600" />}
            </TabsTrigger>
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
            <VitalsTab patientId={patientId} appointmentId={appointmentId} onNext={navigateToNextTab} />
          </TabsContent>

          {/* Procedure Tab */}
          <TabsContent value="procedure">
            <ProcedureTab patientId={patientId} appointmentId={appointmentId} onNext={navigateToNextTab} />
          </TabsContent>

          {/* Assessment Tab */}
          <TabsContent value="assessment">
            <AssessmentTab patientId={patientId} appointmentId={appointmentId} onNext={navigateToNextTab} />
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan">
            <PlanTab patientId={patientId} appointmentId={appointmentId} onClose={onClose} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          {activeTab !== "plan" && (
            <Button onClick={navigateToNextTab} className="flex items-center gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {activeTab == "plan" && (
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowNewAppointment(true)}
                className="theme-button text-white"
              >
                Book Another Appointment
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
      <NewAppointment 
        isOpen={showNewAppointment} 
        onClose={() => setShowNewAppointment(false)}
        patientId={patientId}
      />
    </Sheet>
  )
}

// Wrap the exported component with the provider
export default function PatientInformation(props: PatientInformationProps) {
  return (
    <TabCompletionProvider>
      <PatientInformationContent {...props} />
    </TabCompletionProvider>
  )
}