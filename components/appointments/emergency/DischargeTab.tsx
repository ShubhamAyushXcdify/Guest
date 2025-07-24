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

  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId);
  const createDischarge = useCreateEmergencyDischarge({
    onSuccess: () => {
      toast.success("Discharge record saved successfully");
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save discharge record");
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        nextAppointmentDate: nextAppointment,
        reviewedWithClient: confirmed,
        isCompleted: true,
        prescriptions: (medications.map(med => ({
          visitId: visitData.id,
          medicationName: med.name,
          dose: med.dose,
          frequency: med.frequency,
          duration: med.duration,
          isCompleted: true,
        })) as any),
      });
    } catch (e) {
      // error handled in onError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
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
          <div className="border rounded p-2 bg-gray-50 text-sm">
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
      <div>
        <Label htmlFor="nextAppointment">Next Appointment</Label>
        <Input
          id="nextAppointment"
          type="date"
          value={nextAppointment}
          onChange={e => setNextAppointment(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="confirmed" checked={confirmed} onCheckedChange={val => setConfirmed(val === true)} />
        <Label htmlFor="confirmed">Reviewed with client / Signature</Label>
      </div>
      <div>
        <Button onClick={handleSubmit} disabled={isSubmitting || visitLoading} className="theme-button w-full mt-4">
          {isSubmitting ? "Saving..." : "Submit Discharge"}
        </Button>
      </div>
    </div>
  );
} 