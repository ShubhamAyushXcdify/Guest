import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface VitalDetail {
  id: string;
  visitId: string;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRateBpm?: number;
  mucousMembraneColor?: string;
  capillaryRefillTimeSec?: number;
  hydrationStatus?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateVitalDetailData {
  visitId: string;
  temperatureC?: number;
  heartRateBpm?: number;
  respiratoryRateBpm?: number;
  mucousMembraneColor?: string;
  capillaryRefillTimeSec?: number;
  hydrationStatus?: string;
  notes?: string;
  isCompleted: boolean;
}

const createVitalDetail = async (data: CreateVitalDetailData): Promise<VitalDetail> => {
  try {
    const response = await fetch('/api/VitalDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create vital detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating vital detail:', error);
    throw error;
  }
};

export const useCreateVitalDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: VitalDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVitalDetail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vitalDetail', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 