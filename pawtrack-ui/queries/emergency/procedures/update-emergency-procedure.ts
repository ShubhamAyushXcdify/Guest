import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmergencyVisitProcedure, Medication } from "./get-emergency-procedures";

interface UpdateEmergencyProcedureData extends Partial<Omit<EmergencyVisitProcedure, 'createdAt' | 'updatedAt'>> {
  id: string;
  fluidsVolumeMl?: number | null;
  fluidsRateMlHr?: number | null;
}

const updateEmergencyProcedure = async (data: UpdateEmergencyProcedureData): Promise<EmergencyVisitProcedure> => {
  const { id, ...updateData } = data;
  if (!id) {
    throw new Error("Procedure ID is required");
  }
  const response = await fetch(`/api/emergency/procedure/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update emergency visit procedure');
  }
  return await response.json();
};

export const useUpdateEmergencyProcedure = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: EmergencyVisitProcedure) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmergencyProcedure,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyProcedures'] });
      queryClient.invalidateQueries({ queryKey: ['emergencyProcedure', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 