import { useQuery } from "@tanstack/react-query";

export interface WeightHistoryItem {
  weightKg: number;
  date: string;
  source: string;
  appointmentId: string;
  visitId: string;
  createdAt: string;
}

export interface WeightHistoryResponse {
  patientId: string;
  patientName: string;
  weightHistory: WeightHistoryItem[];
}


export const useGetWeightHistory = (patientId: string) => {
  return useQuery<WeightHistoryResponse>({
    queryKey: ["weightHistory", patientId],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/weight-history`);
      if (!response.ok) throw new Error("Failed to fetch weight history");
      return response.json();
    },
    enabled: !!patientId,
  });
};

