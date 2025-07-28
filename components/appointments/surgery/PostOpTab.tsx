import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetSurgeryPostOpByVisitId } from "@/queries/surgery/postop/get-surgery-postop-by-visit-id";
import { useCreateSurgeryPostOp } from "@/queries/surgery/postop/create-surgery-postop";
import { useUpdateSurgeryPostOp } from "@/queries/surgery/postop/update-surgery-postop";
import { toast } from "sonner";
import { useSurgeryTabCompletion } from "./index";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);
  const { data: postOpData, refetch } = useGetSurgeryPostOpByVisitId(visitData?.id || "", !!visitData?.id);
  const createPostOp = useCreateSurgeryPostOp();
  const updatePostOp = useUpdateSurgeryPostOp();
  const { markTabAsCompleted } = useSurgeryTabCompletion();
  const { data: appointmentData } = useGetAppointmentById(appointmentId);
  const isReadOnly = appointmentData?.status === "completed";

  useEffect(() => {
    if (postOpData && postOpData.length > 0) {
      const data = postOpData[0];
      setRecovery(data.recoveryStatus || recoveryStatus[0]);
      setPainLevel(data.painAssessment || painLevels[0]);
      setVitalSigns(data.vitalSigns || "");
      setMedications(data.postOpMedications || "");
      setWoundCare(data.woundCare || "");
      setNotes(data.notes || "");
    }
  }, [postOpData]);

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      visitId: visitData.id,
      recoveryStatus: recovery,
      painAssessment: painLevel,
      vitalSigns,
      postOpMedications: medications,
      woundCare,
      notes,
      isCompleted: true,
    };
    try {
      if (postOpData && postOpData.length > 0) {
        await updatePostOp.mutateAsync({ id: postOpData[0].id, ...payload });
        toast.success("Post-op record updated successfully");
      } else {
        await createPostOp.mutateAsync(payload);
        toast.success("Post-op record saved successfully");
      }
      await refetch();
      markTabAsCompleted("post-op");
    } catch (e: any) {
      toast.error(e.message || "Failed to save post-op record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Recovery Status</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={recovery}
              onChange={e => setRecovery(e.target.value)}
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Post-op Medications</label>
            <Textarea
              value={medications}
              onChange={e => setMedications(e.target.value)}
              placeholder="List medications given post-operatively"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Wound Care</label>
            <Textarea
              value={woundCare}
              onChange={e => setWoundCare(e.target.value)}
              placeholder="Describe wound care instructions and status"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional post-operative notes"
              disabled={isReadOnly}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isReadOnly}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {postOpData && postOpData.length > 0 ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 