import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useCreateEmergencyVisit } from "@/queries/emergency/triage/create-emergency-visit";
import { useGetEmergencyVisitByVisitId } from "@/queries/emergency/triage/get-emergency-visit-by-visit-id";
import { useUpdateEmergencyVisit } from "@/queries/emergency/triage/update-emergency-visit";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { useTabCompletion } from "@/context/TabCompletionContext";

interface TriageTabProps {
  patientId: string;
  appointmentId: string;
  onNext?: () => void;
}

const triageCategories = [
  { value: "critical", label: "Critical", color: "text-red-600" },
  { value: "urgent", label: "Urgent", color: "text-orange-600" },
  { value: "stable", label: "Stable", color: "text-green-600" },
  { value: "non-urgent", label: "Non-urgent", color: "text-blue-600" },
];

export default function TriageTab({ patientId, appointmentId, onNext }: TriageTabProps) {
  const [arrivalTime, setArrivalTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [nurse, setNurse] = useState("");
  const [triageCategory, setTriageCategory] = useState("");
  const [painScore, setPainScore] = useState("");
  const [allergies, setAllergies] = useState("");
  const [immediateIntervention, setImmediateIntervention] = useState(false);
  const [reason, setReason] = useState("");
  const [triageLevel, setTriageLevel] = useState("");
  const [presentingComplaint, setPresentingComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId);
  const { data: triageData, isLoading: triageLoading, refetch: refetchTriage } = useGetEmergencyVisitByVisitId(visitData?.id || "", !!visitData?.id);
  const createTriage = useCreateEmergencyVisit();
  const updateTriage = useUpdateEmergencyVisit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const { markTabAsCompleted } = useTabCompletion();

  useEffect(() => {
    const data = triageData;
    if (data) {
      setArrivalTime(data.arrivalTime ? data.arrivalTime.slice(0, 16) : "");
      setNurse(data.triageNurseDoctor || "");
      setTriageCategory(data.triageCategory || "");
      setPainScore(data.painScore !== undefined ? String(data.painScore) : "");
      setAllergies(data.allergies || "");
      setImmediateIntervention(!!data.immediateInterventionRequired);
      setReason(data.reasonForEmergency || "");
      setTriageLevel(data.triageLevel || "");
      setPresentingComplaint(data.presentingComplaint || "");
      setNotes(data.initialNotes || "");
    }
  }, [triageData]);

  const handleSubmit = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    setIsSubmitting(true);
    try {
      if (triageData && triageData.id) {
        // Update existing triage
        await updateTriage.mutateAsync({
          id: triageData.id,
          arrivalTime,
          triageNurseDoctor: nurse,
          triageCategory,
          painScore: painScore ? Number(painScore) : 0,
          allergies,
          immediateInterventionRequired: immediateIntervention,
          reasonForEmergency: reason,
          triageLevel,
          presentingComplaint,
          initialNotes: notes,
          visitId: visitData.id,
        });
        toast.success("Triage record updated successfully");
      } else {
        // Create new triage
        await createTriage.mutateAsync({
          arrivalTime,
          triageNurseDoctor: nurse,
          triageCategory,
          painScore: painScore ? Number(painScore) : 0,
          allergies,
          immediateInterventionRequired: immediateIntervention,
          reasonForEmergency: reason,
          triageLevel,
          presentingComplaint,
          initialNotes: notes,
          visitId: visitData.id,
        });
        toast.success("Triage record saved successfully");
      }
      await refetchTriage();
      if (onNext) onNext();
    } catch (e: any) {
      toast.error(e.message || "Failed to save triage record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="arrivalTime">Arrival Time</Label>
            <Input
              id="arrivalTime"
              type="datetime-local"
              value={arrivalTime}
              onChange={e => setArrivalTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nurse">Triage Nurse/Doctor</Label>
            <Input
              id="nurse"
              placeholder="Name of triage nurse/doctor"
              value={nurse}
              onChange={e => setNurse(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="triageCategory">Triage Category</Label>
          <Select value={triageCategory} onValueChange={setTriageCategory}>
            <SelectTrigger id="triageCategory">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {triageCategories.map(cat => (
                <SelectItem key={cat.value} value={cat.value} className={cat.color}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="painScore">Pain Score (0-10)</Label>
            <Input
              id="painScore"
              type="number"
              min={1}
              max={10}
              value={painScore}
              onChange={e => {
                const val = e.target.value;
                // Allow empty string for controlled input
                if (val === "") {
                  setPainScore("");
                  return;
                }
                // Only allow numbers between 1 and 10
                const num = Number(val);
                if (num >= 1 && num <= 10) {
                  setPainScore(val);
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              placeholder="List any allergies"
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="immediateIntervention"
            checked={immediateIntervention}
            onCheckedChange={checked => setImmediateIntervention(checked === true)}
          />
          <Label htmlFor="immediateIntervention">Immediate intervention required</Label>
        </div>
        <div>
          <Label htmlFor="reason">Reason for Emergency</Label>
          <Textarea
            id="reason"
            placeholder="Describe the reason for emergency visit in detail"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="triageLevel">Triage Level</Label>
          <Input
            id="triageLevel"
            placeholder="e.g. Critical, Urgent, Stable"
            value={triageLevel}
            onChange={e => setTriageLevel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="presentingComplaint">Presenting Complaint</Label>
          <Input
            id="presentingComplaint"
            placeholder="Describe the main issue"
            value={presentingComplaint}
            onChange={e => setPresentingComplaint(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="triageNotes">Initial Notes</Label>
          <Textarea
            id="triageNotes"
            placeholder="Additional triage notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || visitLoading || triageLoading}
            className="ml-2"
          >
            {triageData && triageData.id ? "Update" : "Save and Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 