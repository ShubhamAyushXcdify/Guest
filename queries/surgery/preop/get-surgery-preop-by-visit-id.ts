import { useQuery } from "@tanstack/react-query";
import { SurgeryPreOp } from "./get-surgery-preop";

const getSurgeryPreOpByVisitId = async (visitId: string): Promise<SurgeryPreOp[]> => {
  if (!visitId) {
    throw new Error("visitId is required");
  }
  const response = await fetch(`/api/surgery/preop/visit/${visitId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery preop by visitId");
  }
  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  } else if (data) {
    return [data];
  } else {
    return [];
  }
};

export function useGetSurgeryPreOpByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryPreOpByVisitId", visitId],
    queryFn: () => getSurgeryPreOpByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 