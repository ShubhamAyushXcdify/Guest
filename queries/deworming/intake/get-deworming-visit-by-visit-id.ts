import { useQuery } from "@tanstack/react-query";

interface DewormingVisit {
  id: string;
  visitId: string;
  weightKg: number;
  lastDewormingDate: string;
  symptomsNotes?: string;
  temperatureC: number;
  appetiteFeedingNotes?: string;
  currentMedications?: string;
  isStoolSampleCollected: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getDewormingVisitByVisitId = async (visitId: string): Promise<DewormingVisit | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/deworming/intake/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No deworming visit found for this visit - return null instead of throwing
        return null;
      }
      throw new Error("Failed to fetch deworming visit by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching deworming visit by visit ID:", error);
    throw error;
  }
};

export function useGetDewormingVisitByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['deworming', 'visit', visitId],
    queryFn: () => getDewormingVisitByVisitId(visitId),
    enabled: !!visitId && enabled, // Only run query if visitId exists and enabled is true
  });
}
