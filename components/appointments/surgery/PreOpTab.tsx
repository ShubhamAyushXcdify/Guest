import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetSurgeryPreOpByVisitId } from "@/queries/surgery/preop/get-surgery-preop-by-visit-id";
import { useCreateSurgeryPreOp } from "@/queries/surgery/preop/create-surgery-preop";
import { useUpdateSurgeryPreOp } from "@/queries/surgery/preop/update-surgery-preop";
import { toast } from "sonner";
import { useSurgeryTabCompletion } from "./index";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);
  const { data: preOpData, refetch } = useGetSurgeryPreOpByVisitId(visitData?.id || "", !!visitData?.id);
  const createPreOp = useCreateSurgeryPreOp();
  const updatePreOp = useUpdateSurgeryPreOp();
  const { markTabAsCompleted } = useSurgeryTabCompletion();
  const { data: appointmentData } = useGetAppointmentById(appointmentId);
  const isReadOnly = appointmentData?.status === "completed";

const isFormComplete = useMemo(() => {
  return (
    weight.trim() !== "" &&
    bloodwork.trim() !== "" &&
    riskLevel.trim() !== "" &&
    fasting.trim() !== "" &&
    medications.trim() !== "" 
  );
}, [weight, bloodwork, riskLevel, fasting, medications, notes]);


  useEffect(() => {
    if (preOpData && preOpData.length > 0) {
      const data = preOpData[0];
      setWeight(data.weightKg !== undefined && data.weightKg !== null ? String(data.weightKg) : "");
      setBloodwork(data.preOpBloodworkResults || "");
      setRiskLevel(data.anesthesiaRiskAssessment || riskLevels[0]);
      setFasting(data.fastingStatus || fastingStatus[0]);
      setMedications(data.preOpMedications || "");
      setNotes(data.notes || "");
    }
  }, [preOpData]);

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      visitId: visitData.id,
      weightKg: weight ? parseFloat(weight) : undefined,
      preOpBloodworkResults: bloodwork,
      anesthesiaRiskAssessment: riskLevel,
      fastingStatus: fasting,
      preOpMedications: medications,
      notes,
      isCompleted: true,
    };
    try {
      if (preOpData && preOpData.length > 0) {
        await updatePreOp.mutateAsync({ id: preOpData[0].id, ...payload });
        toast.success("Pre-op record updated successfully");
      } else {
        await createPreOp.mutateAsync(payload);
        toast.success("Pre-op record saved successfully");
      }
      await refetch();
      markTabAsCompleted("pre-op");
    } catch (e: any) {
      toast.error(e.message || "Failed to save pre-op record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Weight (kg)</label>
            <Input
              type="number"
              step="0.01"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Pre-op Bloodwork Results</label>
            <Textarea
              value={bloodwork}
              onChange={e => setBloodwork(e.target.value)}
              placeholder="Enter bloodwork results and any abnormalities"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Anesthesia Risk Assessment</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={riskLevel}
              onChange={e => setRiskLevel(e.target.value)}
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional pre-operative notes"
              disabled={isReadOnly}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isReadOnly || !isFormComplete}
              className="bg-black text-white px-4 py-2 rounded enabled:hover:bg-gray-800 disabled:opacity-50"
            >
              {preOpData && preOpData.length > 0 ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 