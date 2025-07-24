import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetEmergencyProceduresByVisitId } from "@/queries/emergency/procedures/get-emergency-procedures-by-visit-id";
import { useCreateEmergencyProcedure } from "@/queries/emergency/procedures/create-emergency-procedure";
import { useUpdateEmergencyProcedure } from "@/queries/emergency/procedures/update-emergency-procedure";
import { EmergencyVisitProcedure } from "@/queries/emergency/procedures/get-emergency-procedures";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface EmergencyProceduresTabProps {
  patientId: string;
  appointmentId: string;
  onNext?: () => void;
}

const commonProcedures = [
  "IV Catheter Placement",
  "Oxygen Therapy",
  "CPR",
  "Wound Care",
  "Bandaging",
  "Defibrillation",
  "Blood Transfusion",
  "Intubation",
  "Other"
];

export default function EmergencyProceduresTab({ patientId, appointmentId, onNext }: EmergencyProceduresTabProps) {
  const [procedure, setProcedure] = useState("");
  const [procedureTime, setProcedureTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [performedBy, setPerformedBy] = useState("");
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationRow, setMedicationRow] = useState({ name: "", dose: "", route: "", time: "" });
  const [fluids, setFluids] = useState({ type: "", volume: "", rate: "" });
  const [response, setResponse] = useState("");
  const [notes, setNotes] = useState("");
  const [procedureChecks, setProcedureChecks] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId);
  const { data: proceduresData, isLoading: proceduresLoading, refetch: refetchProcedures } = useGetEmergencyProceduresByVisitId(visitData?.id || "", !!visitData?.id);
  const createProcedure = useCreateEmergencyProcedure();
  const updateProcedure = useUpdateEmergencyProcedure();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form if procedure exists
  useEffect(() => {
    if (proceduresData && proceduresData.length > 0) {
      const proc: EmergencyVisitProcedure = proceduresData[0];
      setProcedureChecks([
        proc.ivCatheterPlacement && "IV Catheter Placement",
        proc.oxygenTherapy && "Oxygen Therapy",
        proc.cpr && "CPR",
        proc.woundCare && "Wound Care",
        proc.bandaging && "Bandaging",
        proc.defibrillation && "Defibrillation",
        proc.bloodTransfusion && "Blood Transfusion",
        proc.intubation && "Intubation",
        proc.otherProcedure && "Other",
      ].filter(Boolean) as string[]);
      setProcedure(proc.otherProcedurePerformed || "");
      setProcedureTime(proc.procedureTime ? proc.procedureTime.slice(0, 16) : "");
      setPerformedBy(proc.performedBy || "");
      setMedications(proc.medications || []);
      setFluids({
        type: proc.fluidsType || "",
        volume: proc.fluidsVolumeMl ? String(proc.fluidsVolumeMl) : "",
        rate: proc.fluidsRateMlHr ? String(proc.fluidsRateMlHr) : "",
      });
      setResponse(proc.responseToTreatment || "");
      setNotes(proc.notes || "");
    }
  }, [proceduresData]);

  const handleProcedureCheck = (proc: string) => {
    setProcedureChecks(prev => prev.includes(proc) ? prev.filter(p => p !== proc) : [...prev, proc]);
  };

  const handleAddMedication = () => {
    if (medicationRow.name && medicationRow.dose && medicationRow.route && medicationRow.time) {
      setMedications([...medications, medicationRow]);
      setMedicationRow({ name: "", dose: "", route: "", time: "" });
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    // Map procedureChecks to boolean fields
    const checks = {
      ivCatheterPlacement: procedureChecks.includes("IV Catheter Placement"),
      oxygenTherapy: procedureChecks.includes("Oxygen Therapy"),
      cpr: procedureChecks.includes("CPR"),
      woundCare: procedureChecks.includes("Wound Care"),
      bandaging: procedureChecks.includes("Bandaging"),
      defibrillation: procedureChecks.includes("Defibrillation"),
      bloodTransfusion: procedureChecks.includes("Blood Transfusion"),
      intubation: procedureChecks.includes("Intubation"),
      otherProcedure: procedureChecks.includes("Other"),
    };
    const payload = {
      visitId: visitData.id,
      procedureTime,
      ...checks,
      otherProcedurePerformed: procedure,
      performedBy,
      medications,
      fluidsType: fluids.type,
      fluidsVolumeMl: fluids.volume ? Number(fluids.volume) : 0,
      fluidsRateMlHr: fluids.rate ? Number(fluids.rate) : 0,
      responseToTreatment: response,
      notes,
      isCompleted: true,
    };
    try {
      if (proceduresData && proceduresData.length > 0) {
        // Update
        await updateProcedure.mutateAsync({ id: proceduresData[0].id, ...payload });
        toast.success("Emergency procedure updated successfully");
      } else {
        // Create
        await createProcedure.mutateAsync(payload);
        toast.success("Emergency procedure saved successfully");
      }
      await refetchProcedures();
      if (onNext) onNext();
    } catch (e: any) {
      toast.error(e.message || "Failed to save emergency procedure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <Label>Common Emergency Procedures</Label>
          <div className="flex flex-wrap gap-4 mt-2">
            {commonProcedures.map(proc => (
              <div key={proc} className="flex items-center space-x-2">
                <Checkbox id={proc} checked={procedureChecks.includes(proc)} onCheckedChange={() => handleProcedureCheck(proc)} />
                <Label htmlFor={proc}>{proc}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="procedure">Other Procedure Performed</Label>
            <Input
              id="procedure"
              placeholder="Describe the emergency procedure"
              value={procedure}
              onChange={e => setProcedure(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="procedureTime">Procedure Time</Label>
            <Input
              id="procedureTime"
              type="datetime-local"
              value={procedureTime}
              onChange={e => setProcedureTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="performedBy">Performed By</Label>
          <Input
            id="performedBy"
            placeholder="Name of clinician"
            value={performedBy}
            onChange={e => setPerformedBy(e.target.value)}
          />
        </div>
        <div>
          <Label>Medications Given</Label>
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
              placeholder="Route"
              value={medicationRow.route}
              onChange={e => setMedicationRow({ ...medicationRow, route: e.target.value })}
            />
            <Input
              type="time"
              placeholder="Time"
              value={medicationRow.time}
              onChange={e => setMedicationRow({ ...medicationRow, time: e.target.value })}
            />
            <Button type="button" variant="outline" onClick={handleAddMedication}>Add</Button>
          </div>
          {medications.length > 0 && (
            <div className="border rounded p-2 bg-gray-50 text-sm">
              <div className="font-medium mb-1">Medications List:</div>
              <ul>
                {medications.map((med, idx) => (
                  <li key={idx}>{med.name} - {med.dose} - {med.route} at {med.time}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fluidType">Fluids Administered (Type)</Label>
            <Input
              id="fluidType"
              placeholder="e.g. Saline, LRS"
              value={fluids.type}
              onChange={e => setFluids({ ...fluids, type: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fluidVolume">Volume (ml)</Label>
            <Input
              id="fluidVolume"
              placeholder="e.g. 500"
              value={fluids.volume}
              onChange={e => setFluids({ ...fluids, volume: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fluidRate">Rate (ml/hr)</Label>
            <Input
              id="fluidRate"
              placeholder="e.g. 100"
              value={fluids.rate}
              onChange={e => setFluids({ ...fluids, rate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="response">Response to Treatment</Label>
          <Textarea
            id="response"
            placeholder="Describe patient response"
            value={response}
            onChange={e => setResponse(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="procedureNotes">Notes</Label>
          <Textarea
            id="procedureNotes"
            placeholder="Additional notes on procedures"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || visitLoading || proceduresLoading}
            className="ml-2"
          >
            {proceduresData ? "Update" : "Save and Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 