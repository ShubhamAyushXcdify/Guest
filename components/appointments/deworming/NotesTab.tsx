import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useGetDewormingNoteByVisitId } from "@/queries/deworming/note/get-deworming-note-by-visit-id";
import { useCreateDewormingNote } from "@/queries/deworming/note/create-deworming-note";
import { useUpdateDewormingNote } from "@/queries/deworming/note/update-deworming-note";
import { Card, CardContent } from "@/components/ui/card";

interface NotesTabProps {
  patientId: string;
  appointmentId: string;
  visitId?: string;
  onComplete?: (completed: boolean) => void;
  onNext?: () => void;
  isCompleted?: boolean;
}

export default function NotesTab({ patientId, appointmentId, visitId, onComplete, onNext, isCompleted = false }: NotesTabProps) {
  const [reactions, setReactions] = useState("");
  const [notes, setNotes] = useState("");
  const [ownerQuestions, setOwnerQuestions] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState("Resolved");
  const [isSaving, setIsSaving] = useState(false);

  // Use visitId if available, otherwise fall back to appointmentId
  const effectiveVisitId = visitId || appointmentId;
  // Use the correct hook for fetching note by visitId (appointmentId)
  const { data: noteData, isLoading, isError, refetch } = useGetDewormingNoteByVisitId(effectiveVisitId);
  const createMutation = useCreateDewormingNote();
  const updateMutation = useUpdateDewormingNote();
  
  // Extract the first note if data is an array
  const data = Array.isArray(noteData) ? noteData[0] : noteData;

  // Notify parent component when data is loaded
  useEffect(() => {
    if (data && onComplete) {
      onComplete(!!data.isCompleted);
    }
  }, [data, onComplete]);

  useEffect(() => {
    if (data) {
      setReactions(data.adverseReactions || "");
      setNotes(data.additionalNotes || "");
      setOwnerQuestions(data.ownerConcerns || "");
      setFollowUpRequired(!!data.followUpRequired);
      setResolutionStatus(data.resolutionStatus || "Resolved");
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        visitId: effectiveVisitId,
        adverseReactions: reactions || undefined,
        additionalNotes: notes || undefined,
        ownerConcerns: ownerQuestions || undefined,
        followUpRequired,
        resolutionStatus: resolutionStatus || undefined,
        isCompleted: true, // Mark as completed
      };
      
      if (data && data.id) {
        await updateMutation.mutateAsync({ id: data.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      
      await refetch();
      
      if (onComplete) {
        onComplete(true);
      }
      
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasExistingData = !!data?.id;

  // Show loading indicator while data is being fetched
  if (isLoading) return <div>Loading...</div>;

  // Always render the form, even if there's no data yet
  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="space-y-4">
          {isError && (
            <div className="p-2 bg-red-50 text-red-600 rounded mb-4">
              Error loading notes data. You can still create a new note.
            </div>
          )}
          
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
              disabled={isSaving || createMutation.isPending || updateMutation.isPending}
            >
              {hasExistingData ? "Update & Next" : "Save & Next"}
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

      {/* Show status indicator if completed */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </Card>
  );
} 