import { useQuery } from "@tanstack/react-query";

export interface MedicationPrescription {
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  isCompleted: boolean;
}

export interface DewormingMedicationDetail {
  id: string;
  visitId: string;
  route?: string;
  dateTimeGiven?: string;
  veterinarianName?: string;
  administeredBy?: string;
  remarks?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  prescriptions: MedicationPrescription[];
}

const getDewormingMedicationByVisitId = async (visitId: string): Promise<DewormingMedicationDetail[] | null> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  const response = await fetch(`/api/deworming/medication/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming medication by visitId');
  }
  return response.json();
};

export const useGetDewormingMedicationByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingMedicationByVisitId', visitId],
    queryFn: () => getDewormingMedicationByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}; 