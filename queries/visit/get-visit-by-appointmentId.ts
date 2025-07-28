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
  isDewormingIntakeCompleted: boolean;
  isDewormingMedicationCompleted: boolean;
  isDewormingNotesCompleted: boolean;
  isDewormingCheckoutCompleted: boolean;
  createdAt: string;
  updatedAt: string;
 
}

const getVisitByAppointmentId = async (appointmentId: string): Promise<VisitDetail> => {
  if (!appointmentId) {
    throw new Error('Appointment ID is required');
  }
  
  const response = await fetch(`/api/visit/appointment/${appointmentId}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch visit data');
  }
  
  return response.json();
};

export const useGetVisitByAppointmentId = (appointmentId: string, enabled = true) => {
  return useQuery({
    queryKey: ['visit', 'appointment', appointmentId],
    queryFn: () => getVisitByAppointmentId(appointmentId),
    enabled: !!appointmentId && enabled,
  });
};
