import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetDewormingVisitById } from "@/queries/deworming/intake/get-deworming-visit-by-id";
import { useCreateDewormingVisit } from "@/queries/deworming/intake/create-deworming-visit";
import { useUpdateDewormingVisit } from "@/queries/deworming/intake/update-deworming-visit";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";

interface IntakeTabProps {
  patientId: string;
  appointmentId: string;
}

export default function IntakeTab({ patientId, appointmentId }: IntakeTabProps) {
  const [weight, setWeight] = useState("");
  const [lastDeworming, setLastDeworming] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [temperature, setTemperature] = useState("");
  const [appetite, setAppetite] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [sampleCollected, setSampleCollected] = useState(false);
  const [sampleImage, setSampleImage] = useState<File | null>(null);
  const [sampleImageUrl, setSampleImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: appointmentData } = useGetAppointmentById(appointmentId);
  const isReadOnly = appointmentData?.status === "completed";

  const { data, isLoading, isError, refetch } = useGetDewormingVisitById(appointmentId);
  const createMutation = useCreateDewormingVisit();
  const updateMutation = useUpdateDewormingVisit();

  useEffect(() => {
    if (data) {
      setWeight(data.weightKg?.toString() || "");
      setLastDeworming(data.lastDewormingDate || "");
      setSymptoms(data.symptomsNotes || "");
      setTemperature(data.temperatureC?.toString() || "");
      setAppetite(data.appetiteFeedingNotes || "");
      setCurrentMeds(data.currentMedications || "");
      // No image from backend yet
    }
  }, [data]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        visitId: appointmentId,
        weightKg: weight ? parseFloat(weight) : undefined,
        lastDewormingDate: lastDeworming || undefined,
        symptomsNotes: symptoms || undefined,
        temperatureC: temperature ? parseFloat(temperature) : undefined,
        appetiteFeedingNotes: appetite || undefined,
        currentMedications: currentMeds || undefined,
        isStoolSampleCollected: sampleCollected,
        isCompleted: true,
      };

      if (data?.id) {
        await updateMutation.mutateAsync({ id: data.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      await refetch();
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSampleImage(file);
    if (file) {
      setSampleImageUrl(URL.createObjectURL(file));
    } else {
      setSampleImageUrl(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* {isError && (
            //<div className="text-yellow-600 text-sm">No previous intake found. You can add new intake data below.</div>
          )} */}
          
          <div>
            <label className="block font-medium mb-1">Weight (kg)</label>
            <Input
              type="number"
              step="0.01"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Last Deworming Date</label>
            <Input
              type="date"
              value={lastDeworming}
              onChange={e => setLastDeworming(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Symptoms / Notes</label>
            <Textarea
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="Describe any symptoms or relevant notes"
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Appetite / Feeding Notes</label>
            <Textarea
              value={appetite}
              onChange={e => setAppetite(e.target.value)}
              placeholder="Describe appetite or feeding changes"
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Current Medications</label>
            <Textarea
              value={currentMeds}
              onChange={e => setCurrentMeds(e.target.value)}
              placeholder="List any current medications"
              disabled={isReadOnly}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="block font-medium mb-1">Stool Sample Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isReadOnly}
            />
            {sampleImageUrl && (
              <img src={sampleImageUrl} alt="Stool sample preview" className="mt-2 max-h-40 rounded border" />
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSubmitting || isReadOnly}
              className="bg-black text-white"
            >
              {data?.id ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
