import { useQuery } from "@tanstack/react-query";

interface VisitDetail {
  id: string;
  appointmentId: string;
  isIntakeCompleted: boolean;
  isComplaintsCompleted: boolean;
  isMedicalHistoryCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  intakeDetails?: {
    id: string;
    visitId: string;
    weight?: string;
    notes?: string;
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    images?: {
      id: string;
      imagePath: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
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
