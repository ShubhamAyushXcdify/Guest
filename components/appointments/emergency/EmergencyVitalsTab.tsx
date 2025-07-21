import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface EmergencyVitalsTabProps {
  patientId: string;
  appointmentId: string;
  onNext?: () => void;
}

const mucousColors = [
  { value: "pink", label: "Pink" },
  { value: "pale", label: "Pale" },
  { value: "cyanotic", label: "Cyanotic" },
  { value: "icteric", label: "Icteric" },
  { value: "injected", label: "Injected" },
];
const heartRhythms = [
  { value: "normal", label: "Normal" },
  { value: "arrhythmia", label: "Arrhythmia" },
  { value: "tachycardia", label: "Tachycardia" },
  { value: "bradycardia", label: "Bradycardia" },
];

export default function EmergencyVitalsTab({ patientId, appointmentId, onNext }: EmergencyVitalsTabProps) {
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [tempUnit, setTempUnit] = useState("C");
  const [bloodPressure, setBloodPressure] = useState("");
  const [weight, setWeight] = useState("");
  const [capillaryRefill, setCapillaryRefill] = useState("");
  const [mucousMembrane, setMucousMembrane] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [heartRhythm, setHeartRhythm] = useState("");
  const [suppOxygen, setSuppOxygen] = useState(false);
  const [notes, setNotes] = useState("");

  // Placeholder for repeat vitals table
  const [repeatVitals, setRepeatVitals] = useState<any[]>([]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            placeholder="e.g. 12.5"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="capillaryRefill">Capillary Refill Time (sec)</Label>
          <Input
            id="capillaryRefill"
            placeholder="e.g. 2"
            value={capillaryRefill}
            onChange={e => setCapillaryRefill(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="mucousMembrane">Mucous Membrane Color</Label>
        <Select value={mucousMembrane} onValueChange={setMucousMembrane}>
          <SelectTrigger id="mucousMembrane">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {mucousColors.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="oxygenSaturation">Oxygen Saturation (SpO2 %)</Label>
          <Input
            id="oxygenSaturation"
            placeholder="e.g. 98"
            value={oxygenSaturation}
            onChange={e => setOxygenSaturation(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bloodGlucose">Blood Glucose (mg/dL)</Label>
          <Input
            id="bloodGlucose"
            placeholder="e.g. 110"
            value={bloodGlucose}
            onChange={e => setBloodGlucose(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="temperature">Temperature ({tempUnit === "C" ? "°C" : "°F"})</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="temperature"
              placeholder={tempUnit === "C" ? "e.g. 38.5" : "e.g. 101.3"}
              value={temperature}
              onChange={e => setTemperature(e.target.value)}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => setTempUnit(tempUnit === "C" ? "F" : "C")}>{tempUnit === "C" ? "°C" : "°F"}</Button>
          </div>
        </div>
        <div>
          <Label htmlFor="heartRhythm">Heart Rhythm</Label>
          <Select value={heartRhythm} onValueChange={setHeartRhythm}>
            <SelectTrigger id="heartRhythm">
              <SelectValue placeholder="Select rhythm" />
            </SelectTrigger>
            <SelectContent>
              {heartRhythms.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
          <Input
            id="heartRate"
            placeholder="e.g. 120"
            value={heartRate}
            onChange={e => setHeartRate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="respiratoryRate">Respiratory Rate (bpm)</Label>
          <Input
            id="respiratoryRate"
            placeholder="e.g. 30"
            value={respiratoryRate}
            onChange={e => setRespiratoryRate(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
          <Input
            id="bloodPressure"
            placeholder="e.g. 120/80"
            value={bloodPressure}
            onChange={e => setBloodPressure(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Checkbox id="suppOxygen" checked={suppOxygen} onCheckedChange={setSuppOxygen} />
          <Label htmlFor="suppOxygen">Supplemental oxygen given</Label>
        </div>
      </div>
      <div>
        <Label htmlFor="vitalsNotes">Notes</Label>
        <Textarea
          id="vitalsNotes"
          placeholder="Additional notes on vitals"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>
      <div>
        <Label>Repeat Vitals</Label>
        <div className="rounded border p-2 text-sm text-gray-500 bg-gray-50">(Table of previous vitals would appear here)</div>
      </div>
    </div>
  );
} 