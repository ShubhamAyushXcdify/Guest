import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmergencyVisitVital } from "./get-emergency-vital-by-id";

interface CreateEmergencyVitalData extends Omit<EmergencyVisitVital, 'id' | 'createdAt' | 'updatedAt'> {}

const createEmergencyVital = async (data: CreateEmergencyVitalData): Promise<EmergencyVisitVital> => {
  const response = await fetch('/api/emergency/vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create emergency visit vital');
  }
  return await response.json();
};

export const useCreateEmergencyVital = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: EmergencyVisitVital) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmergencyVital,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyVital', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 