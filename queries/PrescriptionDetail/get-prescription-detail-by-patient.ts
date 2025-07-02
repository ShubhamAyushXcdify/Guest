import { useQuery } from "@tanstack/react-query";
import { PrescriptionDetail as BasePrescriptionDetail } from "./get-prescription-detail-by-id";

export interface PrescriptionDetail extends BasePrescriptionDetail {
  status?: string;
  appointmentDate?: string;
  veterinarianName?: string;
}

const getPrescriptionDetailByPatient = async (patientId: string): Promise<PrescriptionDetail[]> => {
  try {
    if (!patientId) {
      return [];
    }
    const response = await fetch(`/api/PrescriptionDetail/patient/${patientId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      console.warn("Failed to fetch prescription details by patient ID:", response.status);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching prescription details by patient ID:", error);
    return [];
  }
};

export const useGetPrescriptionDetailByPatient = (patientId: string, enabled = true) => {
  return useQuery<PrescriptionDetail[]>({
    queryKey: ['prescriptionDetail', 'patient', patientId],
    queryFn: () => getPrescriptionDetailByPatient(patientId),
    enabled: !!patientId && enabled,
  });
};

export default getPrescriptionDetailByPatient; 