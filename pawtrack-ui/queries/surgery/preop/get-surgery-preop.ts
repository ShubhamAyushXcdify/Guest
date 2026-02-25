import { useQuery } from "@tanstack/react-query";

export interface SurgeryPreOp {
  id: string;
  visitId: string;
  weightKg?: number;
  preOpBloodworkResults?: string;
  anesthesiaRiskAssessment?: string;
  fastingStatus?: string;
  preOpMedications?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getSurgeryPreOp = async (): Promise<SurgeryPreOp[]> => {
  const response = await fetch('/api/surgery/preop');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery preop records");
  }
  return await response.json();
};

export function useGetSurgeryPreOp(enabled = true) {
  return useQuery({
    queryKey: ['surgeryPreOp'],
    queryFn: getSurgeryPreOp,
    enabled,
  });
} 