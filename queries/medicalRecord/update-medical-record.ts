import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MedicalRecord } from "./get-medical-records";

interface UpdateMedicalRecordData {
  id: string;
  clinicId?: string;
  patientId?: string;
  appointmentId?: string;
  veterinarianId?: string;
  visitDate?: string;
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

const updateMedicalRecord = async (data: UpdateMedicalRecordData): Promise<MedicalRecord> => {
  try {
    const { id, ...updateData } = data;
    
    if (!id) {
      throw new Error("Medical record ID is required");
    }
    
    const response = await fetch(`/api/MedicalRecord/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update medical record');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating medical record:', error);
    throw error;
  }
};

export const useUpdateMedicalRecord = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: MedicalRecord) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicalRecord,
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