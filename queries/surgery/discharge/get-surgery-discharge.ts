import { useQuery } from "@tanstack/react-query";

export interface SurgeryDischarge {
  id: string;
  visitId: string;
  dischargeStatus: string;
  dischargeDatetime?: string;
  homeCareInstructions: string;
  medicationsToGoHome: string;
  followUpInstructions: string;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getSurgeryDischarge = async (): Promise<SurgeryDischarge[]> => {
  const response = await fetch('/api/surgery/discharge');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery discharge records");
  }
  return await response.json();
};

export function useGetSurgeryDischarge(enabled = true) {
  return useQuery({
    queryKey: ['surgeryDischarge'],
    queryFn: getSurgeryDischarge,
    enabled,
  });
} 