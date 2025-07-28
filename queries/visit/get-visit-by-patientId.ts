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

const getVisitBypatientId = async (patientId: string): Promise<VisitDetail> => {
  if (!patientId) {
    throw new Error('Appointment ID is required');
  }
  
  const response = await fetch(`/api/visit/patient/${patientId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch visit data');
  }
  
  return response.json();
};

export const useGetVisitByPatientId = (patientId: string, enabled = true) => {
  return useQuery({
    queryKey: ['visit', 'patient', patientId],
    queryFn: () => getVisitBypatientId(patientId),
    enabled: !!patientId && enabled,
  });
};
