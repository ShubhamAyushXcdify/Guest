import { useQuery } from "@tanstack/react-query";
import { Patient } from "./get-patients";

const getPatientById = async (patientId: string) => {
  if (!patientId) {
    throw new Error("Patient ID is required");
  }

  const response = await fetch(`/api/patients/${patientId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch patient data");
  }

  const patient = await response.json();
  return patient as Patient;
};

export function useGetPatientById(patientId: string) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId),
    enabled: !!patientId, // Only run query if patientId exists
  });
}
