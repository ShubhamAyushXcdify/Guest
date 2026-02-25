import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateComplaintDetailRequest {
  visitId: string;
  isCompleted: boolean;
  notes?: string;
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

const createComplaintDetail = async (data: CreateComplaintDetailRequest): Promise<ComplaintDetail> => {
  try {
    const response = await fetch('/api/ComplaintDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create complaint detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating complaint detail:', error);
    throw error;
  }
};

export const useCreateComplaintDetail = ({ 
  onSuccess, 
  onError 
}: {
  onSuccess?: (data: ComplaintDetail) => void;
  onError?: (error: any) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaintDetail,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['complaint'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', 'visit', data.visitId] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      if (onError) onError(error);
    }
  });
}; 