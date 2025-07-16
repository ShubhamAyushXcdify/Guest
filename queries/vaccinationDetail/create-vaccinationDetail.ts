import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define the VaccinationDetail item interface
export interface VaccinationDetailItem {
  visitId: string;
  vaccinationMasterId: string;
  dateGiven: string;
  nextDueDate: string;
  batchNumber: string;
  adverseReactions?: string;
  veterinarianId?: string; // Add the veterinarianId field
}

// Define the VaccinationDetail request interface
export interface VaccinationDetailRequest {
  details: VaccinationDetailItem[];
  isCompleted: boolean;
}

// Define the VaccinationDetail response interface
export interface VaccinationDetailResponse {
  id: string;
  visitId: string;
  vaccinationMasterId: string;
  dateGiven: string;
  nextDueDate: string;
  batchNumber: string;
  adverseReactions?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Function to create a vaccination detail
const createVaccinationDetail = async (request: VaccinationDetailRequest): Promise<VaccinationDetailResponse[]> => {
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
