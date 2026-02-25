import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryDischarge } from "./get-surgery-discharge";

interface UpdateSurgeryDischargeData extends Partial<Omit<SurgeryDischarge, 'createdAt' | 'updatedAt'>> {
  id: string;
}

const updateSurgeryDischarge = async (data: UpdateSurgeryDischargeData): Promise<SurgeryDischarge> => {
  const { id,  } = data;
  if (!id) {
    throw new Error("Discharge ID is required");
  }
  const response = await fetch(`/api/surgery/discharge/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update surgery discharge record');
  }
  return await response.json();
};

export const useUpdateSurgeryDischarge = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryDischarge) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSurgeryDischarge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryDischarge'] });
      queryClient.invalidateQueries({ queryKey: ['surgeryDischarge', data.id] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 