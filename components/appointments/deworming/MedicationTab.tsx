import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useCreateDewormingMedication } from "@/queries/deworming/medication/create-deworming-medication";
import { useUpdateDewormingMedication } from "@/queries/deworming/medication/update-deworming-medication";
import { useGetDewormingMedicationByVisitId, MedicationPrescription } from "@/queries/deworming/medication/get-deworming-medication-by-visit-id";
import { Card, CardContent } from "@/components/ui/card";

interface MedicationTabProps {
  patientId: string;
  appointmentId: string;
  visitId?: string;
  onComplete?: (completed: boolean) => void;
  onNext?: () => void;
  isCompleted?: boolean;
}

interface MedicationItem {
  id?: string;
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  isCompleted: boolean;
}

const frequencyOptions = ["Once daily", "Twice daily", "Three times daily", "As needed", "As directed"];
const durationOptions = ["3 days", "5 days", "7 days", "10 days", "14 days", "As directed"];

export default function MedicationTab({ patientId, appointmentId, visitId, onComplete, onNext, isCompleted = false }: MedicationTabProps) {
  const [medicationRow, setMedicationRow] = useState<MedicationItem>({
    medicationName: "",
    dose: "",
    frequency: frequencyOptions[0],
    duration: durationOptions[0],
    isCompleted: true,
  });
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  
  // Common medication data
  const [route, setRoute] = useState("Oral");
  const [dateTimeGiven, setDateTimeGiven] = useState("");
  const [veterinarianName, setVeterinarianName] = useState("");
  const [administeredBy, setAdministeredBy] = useState("");
  const [remarks, setRemarks] = useState("");

  // Use visitId if available, otherwise fall back to appointmentId
  const effectiveVisitId = visitId || appointmentId;
  // Use the hook for medication data
  const { data: medicationData, isLoading, isError, refetch } = useGetDewormingMedicationByVisitId(effectiveVisitId);
  const createMedication = useCreateDewormingMedication();
  const updateMedication = useUpdateDewormingMedication();

  // Load medications when component mounts or data changes
  useEffect(() => {
    if (medicationData && medicationData.length > 0) {
      const latestMedication = medicationData[0];
      
      // Set common medication data
      setRoute(latestMedication.route || "Oral");
      setDateTimeGiven(latestMedication.dateTimeGiven || "");
      setVeterinarianName(latestMedication.veterinarianName || "");
      setAdministeredBy(latestMedication.administeredBy || "");
      setRemarks(latestMedication.remarks || "");
      
             // Set prescriptions
       const formattedMedications = latestMedication.prescriptions?.map(prescription => ({
         medicationName: prescription.medicationName || "",
         dose: prescription.dose || "",
         frequency: prescription.frequency || frequencyOptions[0],
         duration: prescription.duration || durationOptions[0],
         isCompleted: prescription.isCompleted
       })) || [];
      
      setMedications(formattedMedications);
      
      // Notify parent about completion status
      if (onComplete) {
        onComplete(latestMedication.isCompleted);
      }
    }
  }, [medicationData, onComplete]);

  const handleAddMedication = () => {
    // Require at least medication name and dose
    if (medicationRow.medicationName && medicationRow.dose) {
      if (currentEditingIndex !== null) {
        // Update existing medication
        const updatedMedications = [...medications];
        updatedMedications[currentEditingIndex] = medicationRow;
        setMedications(updatedMedications);
        setCurrentEditingIndex(null);
      } else {
        // Add new medication
        setMedications([...medications, medicationRow]);
      }
      
      // Reset form
      setMedicationRow({
        medicationName: "",
        dose: "",
        frequency: frequencyOptions[0],
        duration: durationOptions[0],
        isCompleted: true,
      });
    }
  };

  const handleEditMedication = (index: number) => {
    setMedicationRow(medications[index]);
    setCurrentEditingIndex(index);
  };

  const handleRemoveMedication = (index: number) => {
    const updatedMedications = medications.filter((_, idx) => idx !== index);
    setMedications(updatedMedications);
  };

  const handleSaveMedications = async () => {
    setIsSaving(true);
    try {
      // Format prescriptions for the API
      const prescriptions: MedicationPrescription[] = medications.map(med => ({
        medicationName: med.medicationName,
        dose: med.dose,
        frequency: med.frequency,
        duration: med.duration,
        isCompleted: med.isCompleted
      }));
      
      // Create payload with the new API structure
      const payload = {
        visitId: effectiveVisitId,
        route: route,
        dateTimeGiven: dateTimeGiven || new Date().toISOString(),
        veterinarianName: veterinarianName,
        administeredBy: administeredBy,
        remarks: remarks,
        isCompleted: true,
        prescriptions: prescriptions
      };
      
      // If we have existing data, use update, otherwise create
      if (medicationData && medicationData.length > 0) {
        await updateMedication.mutateAsync({ 
          id: medicationData[0].id,
          ...payload
        });
      } else {
        await createMedication.mutateAsync(payload);
      }
      
      // After successful save, refetch data
      await refetch();
      
      // Notify parent about completion
      if (onComplete) {
        onComplete(true);
      }
      
      // Move to next tab if provided
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error("Error saving medications:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasExistingData = medicationData && medicationData.length > 0;

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="space-y-6">
          {isError && (
            <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200">
              Error loading medication data. You can still add new medications.
            </div>
          )}

          {/* Common Medication Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Medication Administration Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Route</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={route}
                  onChange={e => setRoute(e.target.value)}
                >
                  <option value="Oral">Oral</option>
                  <option value="Injectable">Injectable</option>
                  <option value="Topical">Topical</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Date/Time Given</label>
                <Input
                  type="datetime-local"
                  value={dateTimeGiven}
                  onChange={e => setDateTimeGiven(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Veterinarian</label>
                <Input
                  value={veterinarianName}
                  onChange={e => setVeterinarianName(e.target.value)}
                  placeholder="Enter veterinarian name"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Administered By</label>
                <Input
                  value={administeredBy}
                  onChange={e => setAdministeredBy(e.target.value)}
                  placeholder="Enter staff name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Remarks</label>
                <Input
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Any special notes about administration"
                />
              </div>
            </div>
          </div>

          {/* Individual Medication Form */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Add Medication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Medication Name</label>
                <Input
                  value={medicationRow.medicationName}
                  onChange={e => setMedicationRow({ ...medicationRow, medicationName: e.target.value })}
                  placeholder="Enter medication name"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Dose</label>
                <Input
                  value={medicationRow.dose}
                  onChange={e => setMedicationRow({ ...medicationRow, dose: e.target.value })}
                  placeholder="e.g., 10mg/kg, 5ml"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Frequency</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={medicationRow.frequency}
                  onChange={e => setMedicationRow({ ...medicationRow, frequency: e.target.value })}
                >
                  {frequencyOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Duration</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={medicationRow.duration}
                  onChange={e => setMedicationRow({ ...medicationRow, duration: e.target.value })}
                >
                  {durationOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAddMedication}
              >
                {currentEditingIndex !== null ? "Update Medication" : "Add Medication"}
              </button>
            </div>
          </div>

          {/* Medications List */}
          {medications.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Medications List</h3>
              <div className="space-y-2">
                {medications.map((med, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border rounded p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEditMedication(idx)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{med.medicationName}</div>
                        <div className="text-sm text-gray-600">
                          Dose: {med.dose} | Frequency: {med.frequency} | Duration: {med.duration}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMedication(idx);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMedication(idx);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {(createMedication.isError || updateMedication.isError) && (
            <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200">
              Error saving medications. Please try again.
            </div>
          )}
          {(createMedication.isSuccess || updateMedication.isSuccess) && (
            <div className="p-3 bg-green-50 text-green-600 rounded border border-green-200">
              Medications saved successfully!
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
              onClick={handleSaveMedications}
              disabled={isSaving || medications.length === 0}
            >
              {isSaving ? "Saving..." : (hasExistingData ? "Update & Next" : "Save & Next")}
            </button>
          </div>
          
          {/* Completion Indicator */}
          {isCompleted && (
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 