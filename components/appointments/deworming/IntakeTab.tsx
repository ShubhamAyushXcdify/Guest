import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateDewormingVisit } from "@/queries/deworming/intake/create-deworming-visit";
import { useUpdateDewormingVisit } from "@/queries/deworming/intake/update-deworming-visit";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";
import { useGetDewormingVisitByVisitId } from "@/queries/deworming/intake/get-deworming-visit-by-visit-id";
import { DatePicker } from "@/components/ui/datePicker";

interface IntakeTabProps {
  patientId: string;
  appointmentId: string;
  visitId?: string;
  onComplete?: (completed: boolean) => void;
  onNext?: () => void;
  isCompleted?: boolean;
}

export default function IntakeTab({ patientId, appointmentId, visitId, onComplete, onNext, isCompleted = false }: IntakeTabProps) {
  const [weight, setWeight] = useState("");
  const [lastDeworming, setLastDeworming] = useState<Date | null>(null);
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
  
  // Use visitId if available, otherwise fall back to appointmentId
  const effectiveVisitId = visitId || appointmentId;
  const { data, isLoading, isError, refetch } = useGetDewormingVisitByVisitId(effectiveVisitId);
  const createMutation = useCreateDewormingVisit();
  const updateMutation = useUpdateDewormingVisit();

  // Notify parent component when data is loaded
  useEffect(() => {
    if (data && onComplete) {
      onComplete(!!data.isCompleted);
    }
  }, [data, onComplete]);

  useEffect(() => {
    if (data) {
      setWeight(data.weightKg?.toString() || "");
      if (data.lastDewormingDate) {
        setLastDeworming(new Date(data.lastDewormingDate));
      }
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
        visitId: effectiveVisitId,
        weightKg: weight ? parseFloat(weight) : undefined,
        lastDewormingDate: lastDeworming ? lastDeworming.toISOString().split('T')[0] : undefined,
        symptomsNotes: symptoms || undefined,
        temperatureC: temperature ? parseFloat(temperature) : undefined,
        appetiteFeedingNotes: appetite || undefined,
        currentMedications: currentMeds || undefined,
        isStoolSampleCollected: sampleCollected,
        isCompleted: true, // Mark as completed
      };

      if (data?.id) {
        await updateMutation.mutateAsync({ id: data.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      await refetch();
      
      if (onComplete) {
        onComplete(true);
      }

      if (onNext) {
        onNext();
      }
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

  const hasExistingData = !!data?.id;

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="space-y-4">
          {isError && (
            <div className="p-2 bg-red-50 text-red-600 rounded mb-4">
              Error loading intake data. You can still create a new record.
            </div>
          )}
          
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
            <DatePicker
              value={lastDeworming}
              onChange={setLastDeworming}
              placeholder="Select last deworming date"
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
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSubmitting || isReadOnly}
              className="bg-black text-white"
            >
              {hasExistingData ? "Update & Next" : "Save & Next"}
            </Button>
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-red-500 text-sm mt-2">Error saving data.</div>
          )}

          {(createMutation.isSuccess || updateMutation.isSuccess) && (
            <div className="text-green-600 text-sm mt-2">Saved successfully!</div>
          )}
        </div>
      </CardContent>

      {/* Show status indicator if completed */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </Card>
  );
}
