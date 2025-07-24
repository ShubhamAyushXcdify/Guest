import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SurgeryTabProps {
  patientId: string;
  appointmentId: string;
}

export default function SurgeryTab({ patientId, appointmentId }: SurgeryTabProps) {
  const [surgeryType, setSurgeryType] = useState("");
  const [surgeon, setSurgeon] = useState("");
  const [anesthesiologist, setAnesthesiologist] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [anesthesiaProtocol, setAnesthesiaProtocol] = useState("");
  const [findings, setFindings] = useState("");
  const [complications, setComplications] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Surgery Type</label>
        <Input
          value={surgeryType}
          onChange={e => setSurgeryType(e.target.value)}
          placeholder="e.g., Spay, Neuter, Mass Removal, etc."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Surgeon</label>
          <Input
            value={surgeon}
            onChange={e => setSurgeon(e.target.value)}
            placeholder="Enter surgeon name"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Anesthesiologist</label>
          <Input
            value={anesthesiologist}
            onChange={e => setAnesthesiologist(e.target.value)}
            placeholder="Enter anesthesiologist name"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Surgery Start Time</label>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Surgery End Time</label>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Anesthesia Protocol</label>
        <Textarea
          value={anesthesiaProtocol}
          onChange={e => setAnesthesiaProtocol(e.target.value)}
          placeholder="Describe the anesthesia protocol used"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Surgical Findings</label>
        <Textarea
          value={findings}
          onChange={e => setFindings(e.target.value)}
          placeholder="Describe what was found during surgery"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Complications</label>
        <Textarea
          value={complications}
          onChange={e => setComplications(e.target.value)}
          placeholder="Note any complications during surgery"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Notes</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional surgical notes"
        />
      </div>
    </div>
  );
} 