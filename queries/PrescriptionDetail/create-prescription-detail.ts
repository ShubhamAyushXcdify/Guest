import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrescriptionDetail } from "./get-prescription-detail-by-id";

export interface ProductMappingRequest {
  productId: string;
  dosage: string | null;
  frequency: string;
  numberOfDays: number;
}

export interface CreatePrescriptionDetailRequest {
  visitId: string;
  notes?: string;
  productMappings: ProductMappingRequest[];
}

const createPrescriptionDetail = async (data: CreatePrescriptionDetailRequest): Promise<PrescriptionDetail> => {
  try {
    const response = await fetch('/api/PrescriptionDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create prescription detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating prescription detail:', error);
    throw error;
  }
};

export const useCreatePrescriptionDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: PrescriptionDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrescriptionDetail,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['prescriptionDetail'] });
      queryClient.invalidateQueries({ queryKey: ['prescriptionDetail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['prescriptionDetail', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default createPrescriptionDetail; 