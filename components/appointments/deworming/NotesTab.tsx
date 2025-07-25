import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesTabProps {
  patientId: string;
  appointmentId: string;
}

export default function NotesTab({ patientId, appointmentId }: NotesTabProps) {
  const [reactions, setReactions] = useState("");
  const [notes, setNotes] = useState("");
  const [ownerQuestions, setOwnerQuestions] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState("Resolved");

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
      <div>
        <label className="block font-medium mb-1">Owner Questions/Concerns</label>
        <Textarea
          value={ownerQuestions}
          onChange={e => setOwnerQuestions(e.target.value)}
          placeholder="Any questions or concerns from the owner"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="follow-up-required"
          checked={followUpRequired}
          onChange={e => setFollowUpRequired(e.target.checked)}
        />
        <label htmlFor="follow-up-required" className="text-sm">Follow-up required</label>
      </div>
      <div>
        <label className="block font-medium mb-1">Resolution Status</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={resolutionStatus}
          onChange={e => setResolutionStatus(e.target.value)}
        >
          <option value="Resolved">Resolved</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Needs Further Investigation">Needs Further Investigation</option>
        </select>
      </div>
    </div>
  );
} 