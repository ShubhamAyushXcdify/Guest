import { useQuery } from "@tanstack/react-query";
import { SurgeryDischarge } from "./get-surgery-discharge";

const getSurgeryDischargeById = async (id: string): Promise<SurgeryDischarge> => {
  if (!id) {
    throw new Error("Discharge ID is required");
  }
  const response = await fetch(`/api/surgery/discharge/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery discharge record");
  }
  return await response.json();
};

export function useGetSurgeryDischargeById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['surgeryDischarge', id],
    queryFn: () => getSurgeryDischargeById(id),
    enabled: !!id && enabled,
  });
} 