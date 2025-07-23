import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmergencyVisitProcedure } from "./get-emergency-procedures";

interface CreateEmergencyProcedureData extends Omit<EmergencyVisitProcedure, 'id' | 'createdAt' | 'updatedAt'> {}

const createEmergencyProcedure = async (data: CreateEmergencyProcedureData): Promise<EmergencyVisitProcedure> => {
  const response = await fetch('/api/emergencyvisit/procedures', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create emergency visit procedure');
  }
  return await response.json();
};

export const useCreateEmergencyProcedure = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: EmergencyVisitProcedure) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmergencyProcedure,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyProcedures'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 