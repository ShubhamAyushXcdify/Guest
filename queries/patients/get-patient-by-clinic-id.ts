import { useQuery } from "@tanstack/react-query";

const getPatientsByClinicId = async (clinicId: string) => {
  try {
    if (!clinicId) {
      console.warn("No clinic ID provided to getPatientsByClinicId, returning empty array");
      return [];
    }
    
    const url = `/api/patients/clinic/${clinicId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Failed to fetch patients by clinic");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching patients by clinic:", error);
    throw error;
  }
};

export function useGetPatientsByClinicId(clinicId: string) {
  return useQuery({
    queryKey: ['patients', 'clinic', clinicId],
    queryFn: () => getPatientsByClinicId(clinicId),
    enabled: !!clinicId, // Only run query if clinicId exists
  });
}
