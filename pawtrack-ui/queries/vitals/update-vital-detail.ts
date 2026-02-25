import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VitalDetail } from "./create-vital-detail";

interface UpdateVitalDetailData {
  id: string;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRateBpm?: number;
  mucousMembraneColor?: string;
  capillaryRefillTimeSec?: number;
  hydrationStatus?: string;
  notes?: string;
  isCompleted?: boolean;
}

const updateVitalDetail = async (data: UpdateVitalDetailData): Promise<VitalDetail> => {
  try {
    const { id, ...updateData } = data;
    
    if (!id) {
      throw new Error("Vital detail ID is required");
    }
    
    const response = await fetch(`/api/VitalDetail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update vital detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating vital detail:', error);
    throw error;
  }
};

export const useUpdateVitalDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: VitalDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVitalDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vitalDetail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['vitalDetail', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 