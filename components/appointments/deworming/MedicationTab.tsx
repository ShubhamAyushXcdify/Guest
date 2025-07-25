import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface MedicationTabProps {
  patientId: string;
  appointmentId: string;
}

const routeOptions = ["Oral", "Injectable"];

export default function MedicationTab({ patientId, appointmentId }: MedicationTabProps) {
  const [medicationRow, setMedicationRow] = useState({
    product: "",
    batch: "",
    dose: "",
    route: routeOptions[0],
    dateGiven: "",
    vet: "",
    manufacturer: "",
    expiry: "",
    administeredBy: "",
    remarks: "",
  });
  const [medications, setMedications] = useState<any[]>([]);

  const handleAddMedication = () => {
    // Require at least product and dose
    if (medicationRow.product && medicationRow.dose) {
      setMedications([...medications, medicationRow]);
      setMedicationRow({
        product: "",
        batch: "",
        dose: "",
        route: routeOptions[0],
        dateGiven: "",
        vet: "",
        manufacturer: "",
        expiry: "",
        administeredBy: "",
        remarks: "",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1">Dewormer Product</label>
          <Input
            value={medicationRow.product}
            onChange={e => setMedicationRow({ ...medicationRow, product: e.target.value })}
            placeholder="Enter product name"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Batch Number</label>
          <Input
            value={medicationRow.batch}
            onChange={e => setMedicationRow({ ...medicationRow, batch: e.target.value })}
            placeholder="Enter batch number"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Dose (mg/kg or ml)</label>
          <Input
            value={medicationRow.dose}
            onChange={e => setMedicationRow({ ...medicationRow, dose: e.target.value })}
            placeholder="Enter dose"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Route</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={medicationRow.route}
            onChange={e => setMedicationRow({ ...medicationRow, route: e.target.value })}
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
            value={medicationRow.dateGiven}
            onChange={e => setMedicationRow({ ...medicationRow, dateGiven: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Veterinarian</label>
          <Input
            value={medicationRow.vet}
            onChange={e => setMedicationRow({ ...medicationRow, vet: e.target.value })}
            placeholder="Enter veterinarian name"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Manufacturer</label>
          <Input
            value={medicationRow.manufacturer}
            onChange={e => setMedicationRow({ ...medicationRow, manufacturer: e.target.value })}
            placeholder="Enter manufacturer name"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Expiry Date</label>
          <Input
            type="date"
            value={medicationRow.expiry}
            onChange={e => setMedicationRow({ ...medicationRow, expiry: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Administered By</label>
          <Input
            value={medicationRow.administeredBy}
            onChange={e => setMedicationRow({ ...medicationRow, administeredBy: e.target.value })}
            placeholder="Enter staff name (if not vet)"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Remarks</label>
          <Input
            value={medicationRow.remarks}
            onChange={e => setMedicationRow({ ...medicationRow, remarks: e.target.value })}
            placeholder="Any special notes about administration"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleAddMedication}
        >
          Add Medication
        </button>
      </div>
      {medications.length > 0 && (
        <div className="border rounded p-2 bg-gray-50 text-sm mt-4">
          <div className="font-medium mb-1">Medications List:</div>
          <ul className="space-y-1">
            {medications.map((med, idx) => (
              <li key={idx}>
                {med.product} | Batch: {med.batch} | Dose: {med.dose} | Route: {med.route} | Date: {med.dateGiven} | Vet: {med.vet} | Manufacturer: {med.manufacturer} | Expiry: {med.expiry} | By: {med.administeredBy} | Remarks: {med.remarks}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 