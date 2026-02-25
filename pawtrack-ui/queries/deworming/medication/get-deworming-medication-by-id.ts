import { useQuery } from "@tanstack/react-query";

export interface DewormingMedicationDetail {
  id: string;
  visitId: string;
  productName?: string;
  batchNumber?: string;
  dose?: string;
  route?: string;
  dateTimeGiven?: string;
  veterinarianName?: string;
  manufacturer?: string;
  expiryDate?: string;
  administeredBy?: string;
  remarks?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getDewormingMedicationById = async (id: string): Promise<DewormingMedicationDetail> => {
  if (!id) {
    throw new Error('DewormingMedication ID is required');
  }
  
  const response = await fetch(`/api/deworming/medication/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming medication data');
  }
  
  return response.json();
};

export const useGetDewormingMedicationById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingMedication', id],
    queryFn: () => getDewormingMedicationById(id),
    enabled: !!id && enabled,
  });
}; 