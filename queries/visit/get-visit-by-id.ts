import { useQuery } from "@tanstack/react-query";

interface VisitDetail {
  id: string;
  appointmentId: string;
  patientId: string;
  isIntakeCompleted: boolean;
  isComplaintsCompleted: boolean;
  isMedicalHistoryCompleted: boolean;
  isVitalsCompleted: boolean;
  isPlanCompleted: boolean;
  isProceduresCompleted: boolean;
  isPrescriptionCompleted: boolean;
  isVaccinationDetailCompleted: boolean;
  isEmergencyTriageCompleted: boolean;
  isEmergencyVitalCompleted: boolean;
  isEmergencyProcedureCompleted: boolean;
  isEmergencyDischargeCompleted: boolean;
  isSurgeryPreOpCompleted: boolean;
  isSurgeryDetailsCompleted: boolean;
  isSurgeryPostOpCompleted: boolean;
  isSurgeryDischargeCompleted: boolean;
  createdAt: string;
  updatedAt: string;

}

const getVisitById = async (visitId: string): Promise<VisitDetail> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  
  const response = await fetch(`/api/visit/${visitId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch visit data');
  }
  
  return response.json();
};

export const useGetVisitById = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['visit', visitId],
    queryFn: () => getVisitById(visitId),
    enabled: !!visitId && enabled,
  });
};
