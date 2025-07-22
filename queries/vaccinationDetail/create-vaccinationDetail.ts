import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define the VaccinationDetail request interface (new payload)
export interface VaccinationDetailRequest {
  visitId: string;
  notes: string;
  isCompleted: boolean;
  vaccinationMasterIds: string[];
}

// Define the VaccinationDetail response interface (keep as generic for now)
export interface VaccinationDetailResponse {
  id: string;
  visitId: string;
  notes: string;
  isCompleted: boolean;
  vaccinationMasterIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Function to create a vaccination detail (new payload)
const createVaccinationDetail = async (request: VaccinationDetailRequest): Promise<VaccinationDetailResponse> => {
  const response = await fetch('/api/vaccinationDetail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create vaccination detail');
  }

  return await response.json();
};

// Hook for creating a vaccination detail
export const useCreateVaccinationDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVaccinationDetail,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vaccinationDetails'] });
    },
    onError: (error) => {
      console.error('Error creating vaccination detail:', error);
    },
  });
};
