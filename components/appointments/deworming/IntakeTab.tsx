import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetDewormingVisitById, useCreateDewormingVisit, useUpdateDewormingVisit } from "@/queries/deworming/intake/get-deworming-visit-by-id";

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

  // API hooks
  const { data, isLoading, isError, refetch } = useGetDewormingVisitById(appointmentId);
  const createMutation = useCreateDewormingVisit();
  const updateMutation = useUpdateDewormingVisit();

  React.useEffect(() => {
    if (data) {
      setWeight(data.weightKg?.toString() || "");
      setLastDeworming(data.lastDewormingDate || "");
      setSymptoms(data.symptomsNotes || "");
      setTemperature(data.temperatureC?.toString() || "");
      setAppetite(data.appetiteFeedingNotes || "");
      setCurrentMeds(data.currentMedications || "");
      setSampleCollected(!!data.isStoolSampleCollected);
    }
  }, [data]);

  const handleSave = async () => {
    const payload = {
      visitId: appointmentId,
      weightKg: weight ? parseFloat(weight) : undefined,
      lastDewormingDate: lastDeworming || undefined,
      symptomsNotes: symptoms || undefined,
      temperatureC: temperature ? parseFloat(temperature) : undefined,
      appetiteFeedingNotes: appetite || undefined,
      currentMedications: currentMeds || undefined,
      isStoolSampleCollected: sampleCollected,
      isCompleted: false,
    };
    if (data && data.id) {
      await updateMutation.mutateAsync({ id: data.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading intake data.</div>;

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
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSave}
          disabled={createMutation.isLoading || updateMutation.isLoading}
        >
          {data && data.id ? "Update" : "Save"}
        </button>
      </div>
      {(createMutation.isError || updateMutation.isError) && (
        <div className="text-red-500 text-sm">Error saving data.</div>
      )}
      {(createMutation.isSuccess || updateMutation.isSuccess) && (
        <div className="text-green-600 text-sm">Saved successfully!</div>
      )}
    </div>
  );
} 