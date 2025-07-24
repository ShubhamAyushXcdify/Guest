import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-4">
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
    </div>
  );
} 