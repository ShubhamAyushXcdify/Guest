import { useQuery } from "@tanstack/react-query";
import { SurgeryPreOp } from "./get-surgery-preop";

const getSurgeryPreOpById = async (id: string): Promise<SurgeryPreOp> => {
  if (!id) {
    throw new Error("PreOp ID is required");
  }
  const response = await fetch(`/api/surgery/preop/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery preop record");
  }
  return await response.json();
};

export function useGetSurgeryPreOpById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['surgeryPreOp', id],
    queryFn: () => getSurgeryPreOpById(id),
    enabled: !!id && enabled,
  });
} 