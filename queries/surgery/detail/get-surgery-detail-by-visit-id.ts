import { useQuery } from "@tanstack/react-query";
import { SurgeryDetail } from "./get-surgery-detail";

const getSurgeryDetailByVisitId = async (visitId: string): Promise<SurgeryDetail[]> => {
  if (!visitId) {
    throw new Error("visitId is required");
  }
  const response = await fetch(`/api/surgery/detail/visit/${visitId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery detail by visitId");
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

export function useGetSurgeryDetailByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryDetailByVisitId", visitId],
    queryFn: () => getSurgeryDetailByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 