import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateComplaintDetailRequest {
  id: string;
  notes?: string;
  isCompleted: boolean;
  visitId?: string;
  symptomIds?: string[];
}

interface ComplaintDetail {
  id: string;
  visitId: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  symptoms?: {
    id: string;
    name: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

const updateComplaintDetail = async (request: UpdateComplaintDetailRequest): Promise<ComplaintDetail> => {
  try {
    const { id } = request;
    
    if (!id) {
      throw new Error("Complaint ID is required");
    }
    
    const response = await fetch(`/api/ComplaintDetail/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update complaint detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating complaint detail:', error);
    throw error;
  }
};

export const useUpdateComplaintDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: ComplaintDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComplaintDetail,
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['complaint', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
};
