import { useQuery } from "@tanstack/react-query";
import { SurgeryDischarge } from "./get-surgery-discharge";

const getSurgeryDischargeByVisitId = async (visitId: string): Promise<SurgeryDischarge[]> => {
  if (!visitId) {
    throw new Error("visitId is required");
  }
  const response = await fetch(`/api/surgery/discharge/visit/${visitId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch surgery discharge by visitId");
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

export function useGetSurgeryDischargeByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ["surgeryDischargeByVisitId", visitId],
    queryFn: () => getSurgeryDischargeByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
} 