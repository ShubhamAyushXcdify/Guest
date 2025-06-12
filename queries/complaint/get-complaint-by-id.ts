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

const getComplaintById = async (id: string): Promise<ComplaintDetail> => {
  try {
    if (!id) {
      throw new Error("Complaint ID is required");
    }
    
    const response = await fetch(`/api/ComplaintDetail/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch complaint detail");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching complaint detail by ID:", error);
    throw error;
  }
};

export function useGetComplaintById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['complaint', 'detail', id],
    queryFn: () => getComplaintById(id),
    enabled: !!id && enabled, // Only run query if id exists and enabled is true
  });
} 