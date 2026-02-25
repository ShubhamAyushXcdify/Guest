import { useQuery } from "@tanstack/react-query";
import { SurgeryDetail } from "./get-surgery-detail";

const getSurgeryDetailById = async (id: string): Promise<SurgeryDetail> => {
  if (!id) {
    throw new Error("Detail ID is required");
  }
  const response = await fetch(`/api/surgery/detail/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery detail record");
  }
  return await response.json();
};

export function useGetSurgeryDetailById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['surgeryDetail', id],
    queryFn: () => getSurgeryDetailById(id),
    enabled: !!id && enabled,
  });
} 