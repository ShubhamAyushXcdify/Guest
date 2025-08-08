import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useCreateEmergencyDischarge } from "@/queries/emergency/discharge/create-emergency-discharge";
import { toast } from "sonner";
import { useRootContext } from '@/context/RootContext';
import { useGetUsers, User } from '@/queries/users/get-users';
import { useGetRoomsByClinicId } from '@/queries/rooms/get-room-by-clinic-id';
import { useGetAppointmentType, AppointmentType } from '@/queries/appointmentType/get-appointmentType';
import { useGetAvailableSlotsByUserId } from '@/queries/users/get-availabelSlots-by-userId';
import { useCreateAppointment } from '@/queries/appointment/create-appointment';
import { Card, CardContent } from "@/components/ui/card";
import { useGetEmergencyDischargeByVisitId } from '@/queries/emergency/discharge/get-emergency-discharge-by-visit-id';
import { useEffect } from 'react';
import { useUpdateAppointment } from "@/queries/appointment/update-appointment";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";


interface DischargeTabProps {
  patientId: string;
  appointmentId: string;
  onClose?: () => void;
}

const dischargeStatuses = [
  { value: "recovered", label: "Recovered" },
  { value: "admitted", label: "Admitted" },
  { value: "referred", label: "Referred" },
  { value: "deceased", label: "Deceased" },
];

export default function DischargeTab({ patientId, appointmentId, onClose }: DischargeTabProps) {
  const [status, setStatus] = useState("");
  const [dischargeTime, setDischargeTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [clinician, setClinician] = useState("");
  const [summary, setSummary] = useState("");
  const [instructions, setInstructions] = useState("");
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationRow, setMedicationRow] = useState({ name: "", dose: "", frequency: "", duration: "" });
  const [followUp, setFollowUp] = useState("");
  const [nextAppointment, setNextAppointment] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [nextApptVet, setNextApptVet] = useState("");
  const [isDischargeSaved, setIsDischargeSaved] = useState(false);

  const { clinic, user } = useRootContext();
  const { data: apptTypes = [] } = useGetAppointmentType(1, 100, '', true);

  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId);
  const { data: dischargeData, isLoading: dischargeLoading } = useGetEmergencyDischargeByVisitId(visitData?.id || '', !!visitData?.id);
  const createDischarge = useCreateEmergencyDischarge({
    onSuccess: () => {
      toast.success("Discharge record saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save discharge record");
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: appointmentData } = useGetAppointmentById(appointmentId);
  const updateAppointmentMutation = useUpdateAppointment({
    onSuccess: () => {
      toast.success("Visit completed successfully");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Failed to update appointment status: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  // Prefill form if discharge data exists
  useEffect(() => {
    if (dischargeData) {
      setStatus(dischargeData.dischargeStatus || '');
      setDischargeTime(dischargeData.dischargeTime ? dischargeData.dischargeTime.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setClinician(dischargeData.responsibleClinician || '');
      setSummary(dischargeData.dischargeSummary || '');
      setInstructions(dischargeData.homeCareInstructions || '');
      setFollowUp(dischargeData.followupInstructions || '');
      setConfirmed(!!dischargeData.reviewedWithClient);
      setMedications(
        Array.isArray(dischargeData.prescriptions)
          ? dischargeData.prescriptions.map(med => ({
              name: med.medicationName || '',
              dose: med.dose || '',
              frequency: med.frequency || '',
              duration: med.duration || '',
            }))
          : []
      );
        setIsDischargeSaved(true); // ✅ Mark as saved
    }
  }, [dischargeData]);

  const isDischargeComplete = (): boolean => {
    return (
      status.trim() !== "" &&
      dischargeTime.trim() !== "" &&
      clinician.trim() !== "" &&
      summary.trim() !== "" &&
      instructions.trim() !== "" &&
   
      confirmed
    );
  };

  // Add this function to check if all emergency tabs are completed
  const areAllEmergencyTabsCompleted = () => {
    if (!visitData) return false;
    
    // Cast visitData to access emergency completion properties
    const visit = visitData as unknown as {
      isEmergencyTriageCompleted?: boolean;
      isEmergencyVitalCompleted?: boolean;
      isEmergencyProcedureCompleted?: boolean;
      isEmergencyDischargeCompleted?: boolean;
    };

 
    
    return (
      visit.isEmergencyTriageCompleted &&
      visit.isEmergencyVitalCompleted &&
      visit.isEmergencyProcedureCompleted &&
      isDischargeComplete() // Current discharge tab completion
    );
  };

    // Get appointment data
  const { data: emergencyData } = useGetAppointmentById(appointmentId) ;

  const isReadOnly = emergencyData?.status === "completed" ;

  const handleAddMedication = () => {
    if (medicationRow.name && medicationRow.dose && medicationRow.frequency && medicationRow.duration) {
      setMedications([...medications, medicationRow]);
      setMedicationRow({ name: "", dose: "", frequency: "", duration: "" });
    }
  };

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    try {
      await createDischarge.mutateAsync({
        visitId: visitData.id,
        dischargeStatus: status,
        dischargeTime,
        responsibleClinician: clinician,
        dischargeSummary: summary,
        homeCareInstructions: instructions,
        followupInstructions: followUp,
        reviewedWithClient: confirmed,
        isCompleted: isDischargeComplete(),
        prescriptions: (medications.map(med => ({
          visitId: visitData.id,
          medicationName: med.name,
          dose: med.dose,
          frequency: med.frequency,
          duration: med.duration,
          isCompleted: true,
        })) as any),
      });
        setIsDischargeSaved(true); // ✅ Mark as saved
    } catch (e) {
      // error handled in onError   
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
    setIsSubmitting(true);
    try {
      // Save discharge as completed
      await createDischarge.mutateAsync({
        visitId: visitData.id,
        dischargeStatus: status,
        dischargeTime,
        responsibleClinician: clinician,
        dischargeSummary: summary,
        homeCareInstructions: instructions,
        followupInstructions: followUp,
        reviewedWithClient: confirmed,
        isCompleted: isDischargeComplete(),
        prescriptions: (medications.map(med => ({
          visitId: visitData.id,
          medicationName: med.name,
          dose: med.dose,
          frequency: med.frequency,
          duration: med.duration,
          isCompleted: true,
        })) as any),
      });

      // Mark appointment as completed
      if (appointmentData.status !== "completed") {
        await updateAppointmentMutation.mutateAsync({
          id: appointmentId,
          data: {
            ...appointmentData,
            status: "completed"
          }
        });
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error during checkout process:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Discharge Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {dischargeStatuses.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dischargeTime">Discharge Time</Label>
            <Input
              id="dischargeTime"
              type="datetime-local"
              value={dischargeTime}
              onChange={e => setDischargeTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="clinician">Responsible Clinician</Label>
          <Input
            id="clinician"
            placeholder="Name of clinician"
            value={clinician}
            onChange={e => setClinician(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="dischargeSummary">Discharge Summary</Label>
          <Textarea
            id="dischargeSummary"
            placeholder="Summarize the emergency care provided"
            value={summary}
            onChange={e => setSummary(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="instructions">Home Care Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Discharge instructions for the client"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
        </div>
        <div>
          <Label>Medications to Go Home</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Name"
              value={medicationRow.name}
              onChange={e => setMedicationRow({ ...medicationRow, name: e.target.value })}
            />
            <Input
              placeholder="Dose"
              value={medicationRow.dose}
              onChange={e => setMedicationRow({ ...medicationRow, dose: e.target.value })}
            />
            <Input
              placeholder="Frequency"
              value={medicationRow.frequency}
              onChange={e => setMedicationRow({ ...medicationRow, frequency: e.target.value })}
            />
            <Input
              placeholder="Duration"
              value={medicationRow.duration}
              onChange={e => setMedicationRow({ ...medicationRow, duration: e.target.value })}
            />
            <Button type="button" variant="outline" onClick={handleAddMedication}>Add</Button>
          </div>
          {medications.length > 0 && (
            <div className="border rounded-lg p-2 bg-gray-50 text-sm mt-2">
              <div className="font-medium mb-1">Medications List:</div>
              <ul>
                {medications.map((med, idx) => (
                  <li key={idx}>{med.name} - {med.dose} - {med.frequency} for {med.duration}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="followUp">Follow-up Instructions</Label>
          <Textarea
            id="followUp"
            placeholder="Follow-up instructions for the client"
            value={followUp}
            onChange={e => setFollowUp(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="confirmed" checked={confirmed} onCheckedChange={val => setConfirmed(val === true)} />
          <Label htmlFor="confirmed">Reviewed with client / Signature</Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || visitLoading || !isDischargeComplete() || isReadOnly}
                className="ml-2"
              >
                {isSubmitting ? "Saving..." : (isDischargeSaved ? "Update Discharge" : "Save Discharge")}
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting || visitLoading || !areAllEmergencyTabsCompleted() || !isDischargeSaved || isReadOnly}
                className="ml-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? "Processing..." : "Checkout"}
              </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
