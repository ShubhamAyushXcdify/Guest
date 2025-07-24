import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PostOpTabProps {
  patientId: string;
  appointmentId: string;
}

const recoveryStatus = ["Excellent", "Good", "Fair", "Poor", "Critical"];
const painLevels = ["None", "Mild", "Moderate", "Severe"];

export default function PostOpTab({ patientId, appointmentId }: PostOpTabProps) {
  const [recovery, setRecovery] = useState(recoveryStatus[0]);
  const [painLevel, setPainLevel] = useState(painLevels[0]);
  const [vitalSigns, setVitalSigns] = useState("");
  const [medications, setMedications] = useState("");
  const [woundCare, setWoundCare] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Recovery Status</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={recovery}
          onChange={e => setRecovery(e.target.value)}
        >
          {recoveryStatus.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Pain Assessment</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={painLevel}
          onChange={e => setPainLevel(e.target.value)}
        >
          {painLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Vital Signs</label>
        <Textarea
          value={vitalSigns}
          onChange={e => setVitalSigns(e.target.value)}
          placeholder="Heart rate, respiratory rate, temperature, etc."
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Post-op Medications</label>
        <Textarea
          value={medications}
          onChange={e => setMedications(e.target.value)}
          placeholder="List medications given post-operatively"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Wound Care</label>
        <Textarea
          value={woundCare}
          onChange={e => setWoundCare(e.target.value)}
          placeholder="Describe wound care instructions and status"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Notes</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional post-operative notes"
        />
      </div>
    </div>
  );
} 