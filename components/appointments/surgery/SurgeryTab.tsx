import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetSurgeryDetailByVisitId } from "@/queries/surgery/detail/get-surgery-detail-by-visit-id";
import { useCreateSurgeryDetail } from "@/queries/surgery/detail/create-surgery-detail";
import { useUpdateSurgeryDetail } from "@/queries/surgery/detail/update-surgery-detail";
import { toast } from "sonner";
import { useSurgeryTabCompletion } from "./index";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);
  const { data: detailData, refetch } = useGetSurgeryDetailByVisitId(visitData?.id || "", !!visitData?.id);
  const createDetail = useCreateSurgeryDetail();
  const updateDetail = useUpdateSurgeryDetail();
  const { markTabAsCompleted } = useSurgeryTabCompletion();
  const { data: appointmentData } = useGetAppointmentById(appointmentId);
  const isReadOnly = appointmentData?.status === "completed";

  useEffect(() => {
    if (detailData && detailData.length > 0) {
      const data = detailData[0];
      setSurgeryType(data.surgeryType || "");
      setSurgeon(data.surgeon || "");
      setAnesthesiologist(data.anesthesiologist || "");
      setStartTime(data.surgeryStartTime ? data.surgeryStartTime.slice(0, 16) : "");
      setEndTime(data.surgeryEndTime ? data.surgeryEndTime.slice(0, 16) : "");
      setAnesthesiaProtocol(data.anesthesiaProtocol || "");
      setFindings(data.surgicalFindings || "");
      setComplications(data.complications || "");
      setNotes(data.notes || "");
    }
  }, [detailData]);

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      visitId: visitData.id,
      surgeryType,
      surgeon,
      anesthesiologist,
      surgeryStartTime: startTime ? new Date(startTime).toISOString() : undefined,
      surgeryEndTime: endTime ? new Date(endTime).toISOString() : undefined,
      anesthesiaProtocol,
      surgicalFindings: findings,
      complications,
      notes,
      isCompleted: true,
    };
    try {
      if (detailData && detailData.length > 0) {
        await updateDetail.mutateAsync({ id: detailData[0].id, ...payload });
        toast.success("Surgery detail updated successfully");
      } else {
        await createDetail.mutateAsync(payload);
        toast.success("Surgery detail saved successfully");
      }
      await refetch();
      markTabAsCompleted("surgery");
    } catch (e: any) {
      toast.error(e.message || "Failed to save surgery detail");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Surgery Type</label>
            <Input
              value={surgeryType}
              onChange={e => setSurgeryType(e.target.value)}
              placeholder="e.g., Spay, Neuter, Mass Removal, etc."
              disabled={isReadOnly}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Surgeon</label>
              <Input
                value={surgeon}
                onChange={e => setSurgeon(e.target.value)}
                placeholder="Enter surgeon name"
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Anesthesiologist</label>
              <Input
                value={anesthesiologist}
                onChange={e => setAnesthesiologist(e.target.value)}
                placeholder="Enter anesthesiologist name"
                disabled={isReadOnly}
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
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Surgery End Time</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Anesthesia Protocol</label>
            <Textarea
              value={anesthesiaProtocol}
              onChange={e => setAnesthesiaProtocol(e.target.value)}
              placeholder="Describe the anesthesia protocol used"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Surgical Findings</label>
            <Textarea
              value={findings}
              onChange={e => setFindings(e.target.value)}
              placeholder="Describe what was found during surgery"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Complications</label>
            <Textarea
              value={complications}
              onChange={e => setComplications(e.target.value)}
              placeholder="Note any complications during surgery"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Additional surgical notes"
              disabled={isReadOnly}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isReadOnly}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {detailData && detailData.length > 0 ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 