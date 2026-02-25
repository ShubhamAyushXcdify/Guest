import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecord } from "./get-medical-records";

interface CreateMedicalRecordData {
  clinicId: string;
  patientId: string;
  appointmentId: string;
  veterinarianId: string;
  visitDate: string;
  chiefComplaint?: string;
  history?: string;
  physicalExamFindings?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpInstructions?: string;
  weightKg?: number;
  temperatureCelsius?: number;
  heartRate?: number;
  respiratoryRate?: number;
}

const createMedicalRecord = async (data: CreateMedicalRecordData): Promise<MedicalRecord> => {
  try {
    const response = await fetch('/api/MedicalRecord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create medical record');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

export const useCreateMedicalRecord = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: MedicalRecord) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicalRecord,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', data.id] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecords', { patientId: data.patientId }] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 