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
  const [temperature, setTemperature] = useState("");
  const [appetite, setAppetite] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [sampleCollected, setSampleCollected] = useState(false);

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
        <label className="block font-medium mb-1">Temperature (°C)</label>
        <Input
          type="number"
          step="0.1"
          value={temperature}
          onChange={e => setTemperature(e.target.value)}
          placeholder="Enter temperature in °C"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Appetite / Feeding Notes</label>
        <Textarea
          value={appetite}
          onChange={e => setAppetite(e.target.value)}
          placeholder="Describe appetite or feeding changes"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Current Medications</label>
        <Textarea
          value={currentMeds}
          onChange={e => setCurrentMeds(e.target.value)}
          placeholder="List any current medications"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sample-collected"
          checked={sampleCollected}
          onChange={e => setSampleCollected(e.target.checked)}
        />
        <label htmlFor="sample-collected" className="text-sm">Stool sample collected</label>
      </div>
    </div>
  );
} 