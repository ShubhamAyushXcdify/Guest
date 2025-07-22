import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VaccinationDetailResponse } from "./create-vaccinationDetail";


export interface UpdateVaccinationDetailRequest {
  id: string;
  notes: string;
  isCompleted: boolean;
  vaccinationMasterIds: string[];
}

// Interface for update input (new payload)
export interface UpdateVaccinationDetailInput {
  id: string;
  data: UpdateVaccinationDetailRequest;
}

// Function to update a vaccination detail
const updateVaccinationDetail = async ({ id, data }: UpdateVaccinationDetailInput): Promise<VaccinationDetailResponse> => {
  const response = await fetch(`/api/vaccinationDetail/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update vaccination detail');
  }

  return await response.json();
};

// Hook for updating a vaccination detail
export const useUpdateVaccinationDetail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateVaccinationDetail,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vaccinationDetails'] });
      queryClient.invalidateQueries({ queryKey: ['vaccinationDetail', data.id] });
      if (data.visitId) {
        queryClient.invalidateQueries({ queryKey: ['vaccinationDetails', 'visit', data.visitId] });
      }
    },
    onError: (error) => {
      console.error('Error updating vaccination detail:', error);
    },
  });
};
