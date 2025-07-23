import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface IntakeTabProps {
  patientId: string;
  appointmentId: string;
}

export default function IntakeTab({ patientId, appointmentId }: IntakeTabProps) {
  const [weight, setWeight] = useState("");
  const [lastDeworming, setLastDeworming] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Weight (kg)</label>
        <Input
          type="number"
          step="0.01"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="Enter weight in kg"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Last Deworming Date</label>
        <Input
          type="date"
          value={lastDeworming}
          onChange={e => setLastDeworming(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Symptoms / Notes</label>
        <Textarea
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Describe any symptoms or relevant notes"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Stool Sample Image (optional)</label>
        <Input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        {file && <div className="text-xs text-gray-500 mt-1">Selected: {file.name}</div>}
      </div>
    </div>
  );
} 