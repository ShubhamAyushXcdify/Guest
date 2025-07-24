import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DischargeTabProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const dischargeStatus = ["Ready for discharge", "Needs monitoring", "Referred to specialist", "Admitted for observation"];

export default function DischargeTab({ patientId, appointmentId, onClose }: DischargeTabProps) {
  const [status, setStatus] = useState(dischargeStatus[0]);
  const [dischargeTime, setDischargeTime] = useState("");
  const [homeCare, setHomeCare] = useState("");
  const [medications, setMedications] = useState("");
  const [followUp, setFollowUp] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Discharge Status</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={status}
          onChange={e => setStatus(e.target.value)}
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
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Home Care Instructions</label>
        <Textarea
          value={homeCare}
          onChange={e => setHomeCare(e.target.value)}
          placeholder="Detailed instructions for home care"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Medications to Go Home</label>
        <Textarea
          value={medications}
          onChange={e => setMedications(e.target.value)}
          placeholder="List medications, dosages, and administration instructions"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Follow-up Instructions</label>
        <Textarea
          value={followUp}
          onChange={e => setFollowUp(e.target.value)}
          placeholder="Follow-up appointment details and instructions"
        />
      </div>
      <button onClick={onClose} className="bg-black text-white px-4 py-2 rounded">Finish & Close</button>
    </div>
  );
} 