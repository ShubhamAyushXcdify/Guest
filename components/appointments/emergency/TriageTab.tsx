import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

  return (
    <div className="space-y-4">
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
            min={0}
            max={10}
            value={painScore}
            onChange={e => setPainScore(e.target.value)}
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
        <Checkbox id="immediateIntervention" checked={immediateIntervention} onCheckedChange={setImmediateIntervention} />
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
    </div>
  );
} 