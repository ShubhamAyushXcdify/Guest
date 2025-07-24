import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PreOpTabProps {
  patientId: string;
  appointmentId: string;
}

const riskLevels = ["Low", "Medium", "High"];
const fastingStatus = ["Fasted 8+ hours", "Fasted 4-8 hours", "Not fasted", "Unknown"];

export default function PreOpTab({ patientId, appointmentId }: PreOpTabProps) {
  const [weight, setWeight] = useState("");
  const [bloodwork, setBloodwork] = useState("");
  const [riskLevel, setRiskLevel] = useState(riskLevels[0]);
  const [fasting, setFasting] = useState(fastingStatus[0]);
  const [medications, setMedications] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Weight (kg)</label>
        <Input
          type="number"
          step="0.01"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="Enter weight in kg"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Pre-op Bloodwork Results</label>
        <Textarea
          value={bloodwork}
          onChange={e => setBloodwork(e.target.value)}
          placeholder="Enter bloodwork results and any abnormalities"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Anesthesia Risk Assessment</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={riskLevel}
          onChange={e => setRiskLevel(e.target.value)}
        >
          {riskLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Fasting Status</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={fasting}
          onChange={e => setFasting(e.target.value)}
        >
          {fastingStatus.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Pre-op Medications</label>
        <Textarea
          value={medications}
          onChange={e => setMedications(e.target.value)}
          placeholder="List any pre-operative medications given"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Notes</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional pre-operative notes"
        />
      </div>
    </div>
  );
} 