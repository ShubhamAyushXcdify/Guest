import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetSurgeryDischargeByVisitId } from "@/queries/surgery/discharge/get-surgery-discharge-by-visit-id";
import { useCreateSurgeryDischarge } from "@/queries/surgery/discharge/create-surgery-discharge";
import { useUpdateSurgeryDischarge } from "@/queries/surgery/discharge/update-surgery-discharge";
import { toast } from "sonner";

interface DischargeTabProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

const dischargeStatus = ["Ready for discharge", "Needs monitoring", "Referred to specialist", "Admitted for observation"];

export default function DischargeTab({ patientId, appointmentId, onClose }: DischargeTabProps) {
  const [status, setStatus] = useState(dischargeStatus[0]);
  const [dischargeTime, setDischargeTime] = useState("");
  const [homeCare, setHomeCare] = useState("");
  const [medications, setMedications] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);
  const { data: dischargeData, refetch } = useGetSurgeryDischargeByVisitId(visitData?.id || "", !!visitData?.id);
  const createDischarge = useCreateSurgeryDischarge();
  const updateDischarge = useUpdateSurgeryDischarge();

  useEffect(() => {
    if (dischargeData && dischargeData.length > 0) {
      const data = dischargeData[0];
      setStatus(data.dischargeStatus || dischargeStatus[0]);
      setDischargeTime(data.dischargeDatetime ? data.dischargeDatetime.slice(0, 16) : "");
      setHomeCare(data.homeCareInstructions || "");
      setMedications(data.medicationsToGoHome || "");
      setFollowUp(data.followUpInstructions || "");
    }
  }, [dischargeData]);

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      visitId: visitData.id,
      dischargeStatus: status,
      dischargeDatetime: dischargeTime ? new Date(dischargeTime).toISOString() : undefined,
      homeCareInstructions: homeCare,
      medicationsToGoHome: medications,
      followUpInstructions: followUp,
      isCompleted: true,
    };
    try {
      if (dischargeData && dischargeData.length > 0) {
        await updateDischarge.mutateAsync({ id: dischargeData[0].id, ...payload });
        toast.success("Discharge record updated successfully");
      } else {
        await createDischarge.mutateAsync(payload);
        toast.success("Discharge record saved successfully");
      }
      await refetch();
      if (onClose) onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save discharge record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Discharge Status</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {dischargeStatus.map(dischargeStatus => (
            <option key={dischargeStatus} value={dischargeStatus}>{dischargeStatus}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Discharge Date/Time</label>
        <Input
          type="datetime-local"
          value={dischargeTime}
          onChange={e => setDischargeTime(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Home Care Instructions</label>
        <Textarea
          value={homeCare}
          onChange={e => setHomeCare(e.target.value)}
          placeholder="Detailed instructions for home care"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Medications to Go Home</label>
        <Textarea
          value={medications}
          onChange={e => setMedications(e.target.value)}
          placeholder="List medications, dosages, and administration instructions"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Follow-up Instructions</label>
        <Textarea
          value={followUp}
          onChange={e => setFollowUp(e.target.value)}
          placeholder="Follow-up appointment details and instructions"
        />
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {dischargeData && dischargeData.length > 0 ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
} 