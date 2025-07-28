import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetSurgeryDischargeByVisitId } from "@/queries/surgery/discharge/get-surgery-discharge-by-visit-id";
import { useCreateSurgeryDischarge } from "@/queries/surgery/discharge/create-surgery-discharge";
import { useUpdateSurgeryDischarge } from "@/queries/surgery/discharge/update-surgery-discharge";
import { toast } from "sonner";
import { useSurgeryTabCompletion } from "./index";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpdateAppointment } from "@/queries/appointment/update-appointment";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DischargeTabProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}
interface ExtendedVisitData {
  isSurgeryPostOpCompleted: boolean;
  isSurgeryDischargeCompleted: boolean;
  isSurgeryDetailsCompleted: boolean;
  isSurgeryPreOpCompleted: boolean;
}

const dischargeStatus = ["Ready for discharge", "Needs monitoring", "Referred to specialist", "Admitted for observation"];

export default function DischargeTab({ patientId, appointmentId, onClose }: DischargeTabProps) {
  const [status, setStatus] = useState(dischargeStatus[0]);
  const [dischargeTime, setDischargeTime] = useState("");
  const [homeCare, setHomeCare] = useState("");
  const [medications, setMedications] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);
  const { data: appointmentData } = useGetAppointmentById(appointmentId);
  const isReadOnly = appointmentData?.status === "completed";
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast.success("Visit completed successfully");
      setIsProcessing(false);
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(`Failed to update appointment status: ${error.message}`);
      setIsProcessing(false);
    }
  });
  const { data: dischargeData, refetch } = useGetSurgeryDischargeByVisitId(visitData?.id || "", !!visitData?.id);
  const createDischarge = useCreateSurgeryDischarge();
  const updateDischarge = useUpdateSurgeryDischarge();
  const { markTabAsCompleted, completedTabs } = useSurgeryTabCompletion();
  const isAppointmentCompleted = appointmentData?.status === "completed";
  const areAllVisitTabsCompleted = (): boolean => {
    if (!visitData) return false;
    const visit = visitData as unknown as ExtendedVisitData;
    return (
      visit.isSurgeryPostOpCompleted &&
      visit.isSurgeryDetailsCompleted &&
      visit.isSurgeryPreOpCompleted
    );
  };

  useEffect(() => {
    if (dischargeData && dischargeData.length > 0) {
      const data = dischargeData[0];
      setStatus(data.dischargeStatus || dischargeStatus[0]);
      setDischargeTime(data.dischargeDatetime ? data.dischargeDatetime.slice(0, 16) : "");
      setHomeCare(data.homeCareInstructions || "");
      setMedications(data.medicationsToGoHome || "");
      setFollowUp(data.followUpInstructions || "");
    }
  }, [dischargeData]);

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      visitId: visitData.id,
      dischargeStatus: status,
      dischargeDatetime: dischargeTime ? new Date(dischargeTime).toISOString() : undefined,
      homeCareInstructions: homeCare,
      medicationsToGoHome: medications,
      followUpInstructions: followUp,
      isCompleted: true,
    };
    try {
      if (dischargeData && dischargeData.length > 0) {
        await updateDischarge.mutateAsync({ id: dischargeData[0].id, ...payload });
        toast.success("Discharge record updated successfully");
      } else {
        await createDischarge.mutateAsync(payload);
        toast.success("Discharge record saved successfully");
      }
      await refetch();
      markTabAsCompleted("discharge");
    } catch (e: any) {
      toast.error(e.message || "Failed to save discharge record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    if (!appointmentData) {
      toast.error("No appointment data found");
      return;
    }
     if (!isAppointmentCompleted && !areAllVisitTabsCompleted()) {
      toast.error("Please complete all tabs before checking out")
      return
    }
    setIsProcessing(true);
    try {
      // First save the discharge details
      await handleSubmit();
      
      // Update appointment status to completed
      await updateAppointmentMutation.mutateAsync({
        id: appointmentId,
        data: {
          ...appointmentData,
          status: "completed"
        }
      });
    } catch (error) {
      console.error("Error during checkout process:", error);
      setIsProcessing(false);
    }
  };
   const allVisitTabsComplete = useMemo(() => areAllVisitTabsCompleted(), [visitData]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {!isAppointmentCompleted && !allVisitTabsComplete && (
          <Alert variant="default" className="mb-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Incomplete Patient Information</AlertTitle>
            <AlertDescription>
              Please complete all tabs before checking out the patient. 
              Tabs that are completed will show in green.
            </AlertDescription>
          </Alert>
        )}
          <div>
            <label className="block font-medium mb-1">Discharge Status</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={status}
              onChange={e => setStatus(e.target.value)}
              disabled={isReadOnly}
            >
              {dischargeStatus.map(dischargeStatus => (
                <option key={dischargeStatus} value={dischargeStatus}>{dischargeStatus}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Discharge Date/Time</label>
            <Input
              type="datetime-local"
              value={dischargeTime}
              onChange={e => setDischargeTime(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Home Care Instructions</label>
            <Textarea
              value={homeCare}
              onChange={e => setHomeCare(e.target.value)}
              placeholder="Detailed instructions for home care"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Medications to Go Home</label>
            <Textarea
              value={medications}
              onChange={e => setMedications(e.target.value)}
              placeholder="List medications, dosages, and administration instructions"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Follow-up Instructions</label>
            <Textarea
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              placeholder="Follow-up appointment details and instructions"
              disabled={isReadOnly}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isProcessing || isReadOnly}
              className="bg-black text-white"
            >
              {dischargeData && dischargeData.length > 0 ? "Update" : "Save"}
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isSubmitting || isProcessing || !allVisitTabsComplete || isReadOnly || !completedTabs.includes("discharge")}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Checkout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 