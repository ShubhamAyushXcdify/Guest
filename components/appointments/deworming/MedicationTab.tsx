import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface MedicationTabProps {
  patientId: string;
  appointmentId: string;
}

const routeOptions = ["Oral", "Injectable"];

export default function MedicationTab({ patientId, appointmentId }: MedicationTabProps) {
  const [product, setProduct] = useState("");
  const [batch, setBatch] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState(routeOptions[0]);
  const [dateGiven, setDateGiven] = useState("");
  const [vet, setVet] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Dewormer Product</label>
        <Input
          value={product}
          onChange={e => setProduct(e.target.value)}
          placeholder="Enter product name"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Batch Number</label>
        <Input
          value={batch}
          onChange={e => setBatch(e.target.value)}
          placeholder="Enter batch number"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Dose (mg/kg or ml)</label>
        <Input
          value={dose}
          onChange={e => setDose(e.target.value)}
          placeholder="Enter dose"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Route</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={route}
          onChange={e => setRoute(e.target.value)}
        >
          {routeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Date/Time Given</label>
        <Input
          type="datetime-local"
          value={dateGiven}
          onChange={e => setDateGiven(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Veterinarian</label>
        <Input
          value={vet}
          onChange={e => setVet(e.target.value)}
          placeholder="Enter veterinarian name"
        />
      </div>
    </div>
  );
} 