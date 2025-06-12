import { useQuery } from "@tanstack/react-query";

const getPatientById = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Patient ID is required");
    }
    
    const url = `/api/patient/${id}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch patient");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw error;
  }
};

export function useGetPatientById(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id),
    enabled: !!id, // Only run query if id exists
  });
}

 