import { useQuery } from "@tanstack/react-query";
import { SurgeryPostOp } from "./get-surgery-postop";

const getSurgeryPostOpById = async (id: string): Promise<SurgeryPostOp> => {
  if (!id) {
    throw new Error("PostOp ID is required");
  }
  const response = await fetch(`/api/surgery/postop/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery postop record");
  }
  return await response.json();
};

export function useGetSurgeryPostOpById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['surgeryPostOp', id],
    queryFn: () => getSurgeryPostOpById(id),
    enabled: !!id && enabled,
  });
} 