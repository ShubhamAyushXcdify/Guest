import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmergencyDischarge } from "./get-emergency-discharge-by-id";

interface UpdateEmergencyDischargeData extends Partial<Omit<EmergencyDischarge, 'createdAt' | 'updatedAt'>> {
  id: string;
}

const updateEmergencyDischarge = async (data: UpdateEmergencyDischargeData): Promise<EmergencyDischarge> => {
  const { id, ...updateData } = data;
  if (!id) {
    throw new Error("Discharge ID is required");
  }
  const response = await fetch(`/api/emergency/discharge/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update emergency discharge');
  }
  return await response.json();
};

export const useUpdateEmergencyDischarge = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: EmergencyDischarge) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmergencyDischarge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['emergencyDischarge', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 