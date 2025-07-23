import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmergencyDischarge } from "./get-emergency-discharge-by-id";

interface CreateEmergencyDischargeData extends Omit<EmergencyDischarge, 'id' | 'createdAt' | 'updatedAt'> {}

const createEmergencyDischarge = async (data: CreateEmergencyDischargeData): Promise<EmergencyDischarge> => {
  const response = await fetch('/api/emergency/discharge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create emergency discharge');
  }
  return await response.json();
};

export const useCreateEmergencyDischarge = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: EmergencyDischarge) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmergencyDischarge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyDischarge', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 