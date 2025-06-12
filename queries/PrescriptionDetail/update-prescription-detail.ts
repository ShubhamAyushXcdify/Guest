import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrescriptionDetail } from "./get-prescription-detail-by-id";
import { ProductMappingRequest } from "./create-prescription-detail";

export interface UpdatePrescriptionDetailRequest {
  id: string;
  notes?: string;
  productMappings?: ProductMappingRequest[];
  visitId?: string;
}

const updatePrescriptionDetail = async (request: UpdatePrescriptionDetailRequest): Promise<PrescriptionDetail> => {
  try {
    const { id } = request;
    
    if (!id) {
      throw new Error("Prescription detail ID is required");
    }
    
    const response = await fetch(`/api/PrescriptionDetail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update prescription detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating prescription detail:', error);
    throw error;
  }
};

export const useUpdatePrescriptionDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: PrescriptionDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrescriptionDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptionDetail', data.id] });
      if (data.visitId) {
        queryClient.invalidateQueries({ queryKey: ['prescriptionDetail', 'visit', data.visitId] });
      }
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};

export default updatePrescriptionDetail;