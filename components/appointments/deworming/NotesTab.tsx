import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesTabProps {
  patientId: string;
  appointmentId: string;
}

export default function NotesTab({ patientId, appointmentId }: NotesTabProps) {
  const [reactions, setReactions] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Adverse Reactions (if any)</label>
        <Textarea
          value={reactions}
          onChange={e => setReactions(e.target.value)}
          placeholder="Describe any adverse reactions observed"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Additional Notes</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any other notes or comments"
        />
      </div>
    </div>
  );
} 