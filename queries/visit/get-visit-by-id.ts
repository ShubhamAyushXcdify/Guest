import { useQuery } from "@tanstack/react-query";

interface VisitDetail {
  id: string;
  appointmentId: string;
  isIntakeCompleted: boolean;
  isComplaintsCompleted: boolean;
  isMedicalHistoryCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  intakeDetails?: {
    id: string;
    visitId: string;
    weight?: string;
    notes?: string;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    images?: {
      id: string;
      imagePath: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

const getVisitById = async (visitId: string): Promise<VisitDetail> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  
  const response = await fetch(`/api/visit/${visitId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch visit data');
  }
  
  return response.json();
};

export const useGetVisitById = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['visit', visitId],
    queryFn: () => getVisitById(visitId),
    enabled: !!visitId && enabled,
  });
};
