import { useQuery } from "@tanstack/react-query";
import { SurgeryPostOp } from "./get-surgery-postop";

const getSurgeryPostOpByVisitId = async (visitId: string): Promise<SurgeryPostOp[]> => {
  if (!visitId) {
    throw new Error("visitId is required");
  }
  const response = await fetch(`/api/surgery/postop/visit/${visitId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery postop by visitId");
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

export function useGetSurgeryPostOpByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryPostOpByVisitId", visitId],
    queryFn: () => getSurgeryPostOpByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 