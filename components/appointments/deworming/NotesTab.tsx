import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useGetDewormingNoteById } from "@/queries/deworming/note/get-deworming-note-by-id";
import { useCreateDewormingNote } from "@/queries/deworming/note/create-deworming-note";
import { useUpdateDewormingNote } from "@/queries/deworming/note/update-deworming-note";
import { Card, CardContent } from "@/components/ui/card";

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

  const { data, isLoading, isError, refetch } = useGetDewormingNoteById(appointmentId);
  const createMutation = useCreateDewormingNote();
  const updateMutation = useUpdateDewormingNote();

  React.useEffect(() => {
    if (data) {
      setReactions(data.adverseReactions || "");
      setNotes(data.additionalNotes || "");
      setOwnerQuestions(data.ownerConcerns || "");
      setFollowUpRequired(!!data.followUpRequired);
      setResolutionStatus(data.resolutionStatus || "Resolved");
    }
  }, [data]);

  const handleSave = async () => {
    const payload = {
      visitId: appointmentId,
      adverseReactions: reactions || undefined,
      additionalNotes: notes || undefined,
      ownerConcerns: ownerQuestions || undefined,
      followUpRequired,
      resolutionStatus: resolutionStatus || undefined,
      isCompleted: false,
    };
    if (data && data.id) {
      await updateMutation.mutateAsync({ id: data.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading notes data.</div>;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Optionally, show a warning if isError */}
          
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
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="bg-black text-white px-4 py-2 rounded"
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {data && data.id ? "Update" : "Save"}
            </button>
          </div>
          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-red-500 text-sm">Error saving data.</div>
          )}
          {(createMutation.isSuccess || updateMutation.isSuccess) && (
            <div className="text-green-600 text-sm">Saved successfully!</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 