import { useQuery } from "@tanstack/react-query";

interface ComplaintSymptom {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintDetail {
  id: string;
  visitId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  symptoms: ComplaintSymptom[];
}

const getComplaintByVisitId = async (visitId: string): Promise<ComplaintDetail | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/ComplaintDetail/visit/${visitId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No complaint found for this visit - return null instead of throwing
        return null;
      }
      throw new Error("Failed to fetch complaint detail by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching complaint detail by visit ID:", error);
    throw error;
  }
};

export function useGetComplaintByVisitId(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['complaint', 'visit', visitId],
    queryFn: () => getComplaintByVisitId(visitId),
    enabled: !!visitId && enabled, // Only run query if visitId exists and enabled is true
  });
} 