import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SurgeryDischarge } from "./get-surgery-discharge";

interface CreateSurgeryDischargeData extends Omit<SurgeryDischarge, 'id' | 'createdAt' | 'updatedAt'> {}

const createSurgeryDischarge = async (data: CreateSurgeryDischargeData): Promise<SurgeryDischarge> => {
  const response = await fetch('/api/surgery/discharge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create surgery discharge record');
  }
  return await response.json();
};

export const useCreateSurgeryDischarge = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: SurgeryDischarge) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSurgeryDischarge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surgeryDischarge'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 