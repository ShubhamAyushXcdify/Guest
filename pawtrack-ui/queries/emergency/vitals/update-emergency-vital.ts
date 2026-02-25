import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmergencyVisitVital } from "./get-emergency-vital-by-id";

interface UpdateEmergencyVitalData extends Partial<Omit<EmergencyVisitVital, 'createdAt' | 'updatedAt'>> {
  id: string;
}

const updateEmergencyVital = async (data: UpdateEmergencyVitalData): Promise<EmergencyVisitVital> => {
  const { id, ...updateData } = data;
  if (!id) {
    throw new Error("Vital detail ID is required");
  }
  const response = await fetch(`/api/emergency/vitals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update emergency visit vital');
  }
  return await response.json();
};

export const useUpdateEmergencyVital = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: EmergencyVisitVital) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmergencyVital,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyVital', data.id] });
      queryClient.invalidateQueries({ queryKey: ['emergencyVital', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 