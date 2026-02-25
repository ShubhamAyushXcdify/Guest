import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateEmergencyVisitData {
  arrivalTime: string;
  triageNurseDoctor: string;
  triageCategory: string;
  painScore: number;
  allergies: string;
  immediateInterventionRequired: boolean;
  reasonForEmergency: string;
  triageLevel?: string | null;
  presentingComplaint: string;
  initialNotes: string;
  visitId: string;
  isComplete?: boolean;
}

export const useCreateEmergencyVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitData: CreateEmergencyVisitData) => {
      const response = await fetch("/api/emergency/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(visitData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw {
          response: { data },
          message: data?.message || "Failed to create emergency visit",
        };
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyVisits"] });
    },
  });
};
