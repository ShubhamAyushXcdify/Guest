import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CheckoutTabProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

export default function CheckoutTab({ patientId, appointmentId, onClose }: CheckoutTabProps) {
  const [summary, setSummary] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [instructions, setInstructions] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Summary</label>
        <Textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Summary of visit and treatment"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Next Deworming Due Date</label>
        <Input
          type="date"
          value={nextDue}
          onChange={e => setNextDue(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Home Care Instructions</label>
        <Textarea
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="Instructions for the client to follow at home"
        />
      </div>
      <button onClick={onClose} className="bg-black text-white px-4 py-2 rounded">Finish & Close</button>
    </div>
  );
} 