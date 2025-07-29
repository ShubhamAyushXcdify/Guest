import { useQuery } from "@tanstack/react-query";

export interface SurgeryDetail {
  id: string;
  visitId: string;
  surgeryType?: string;
  surgeon?: string;
  anesthesiologist?: string;
  surgeryStartTime?: string;
  surgeryEndTime?: string;
  anesthesiaProtocol?: string;
  surgicalFindings?: string;
  complications?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getSurgeryDetail = async (): Promise<SurgeryDetail[]> => {
  const response = await fetch('/api/surgery/detail');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery detail records");
  }
  return await response.json();
};

export function useGetSurgeryDetail(enabled = true) {
  return useQuery({
    queryKey: ['surgeryDetail'],
    queryFn: getSurgeryDetail,
    enabled,
  });
} 