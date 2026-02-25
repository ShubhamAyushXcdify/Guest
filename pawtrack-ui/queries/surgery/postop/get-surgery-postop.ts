import { useQuery } from "@tanstack/react-query";

export interface SurgeryPostOp {
  id: string;
  visitId: string;
  recoveryStatus: string;
  painAssessment: string;
  vitalSigns: string;
  postOpMedications: string;
  woundCare: string;
  notes: string;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getSurgeryPostOp = async (): Promise<SurgeryPostOp[]> => {
  const response = await fetch('/api/surgery/postop');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery postop records");
  }
  return await response.json();
};

export function useGetSurgeryPostOp(enabled = true) {
  return useQuery({
    queryKey: ['surgeryPostOp'],
    queryFn: getSurgeryPostOp,
    enabled,
  });
} 