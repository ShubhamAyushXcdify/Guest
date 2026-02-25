import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface UpdateAppointmentData {
  id: string;
  data: {
    id: string; // Add this line - the appointment ID should be in the data payload
    clinicId?: string;
    patientId?: string;
    clientId?: string;
    veterinarianId?: string;
    roomId?: string;
    appointmentDate?: string;
    appointmentTimeFrom?: string;
    appointmentTimeTo?: string;
    appointmentTypeId?: string;
    reason?: string;
    status?: string;
    notes?: string;
    isRegistered?: boolean;
    createdBy?: string;
    sendEmail?: boolean;
    rejectionReason?: string;
    [key: string]: any; // Allow other properties
  };
}
const updateAppointment = async ({ id, data }: UpdateAppointmentData) => {
  const url = `/api/appointment/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to update appointment');
    throw new Error(message);
  }
  return result;
};

export const useUpdateAppointment = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateAppointment,
    retry: false,
    onSuccess: () => {
      // Invalidate and refetch all appointment-related queries
      queryClient.invalidateQueries({ queryKey: ['appointment'] })
      queryClient.invalidateQueries({ queryKey: ['appointmentList'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['visit'] })
      queryClient.invalidateQueries({ queryKey: ['vitalDetail'] })
      queryClient.invalidateQueries({ queryKey: ['planDetail'] })
      queryClient.invalidateQueries({ queryKey: ['medicalHistoryDetail'] })
      queryClient.invalidateQueries({ queryKey: ['prescriptionDetail'] })
      queryClient.invalidateQueries({ queryKey: ['plan'] })
      queryClient.invalidateQueries({ queryKey: ['medicalHistory'] })
      queryClient.invalidateQueries({ queryKey: ['prescription'] })
      queryClient.invalidateQueries({ queryKey: ['providerStats'] });

      onSuccess?.()
    },
    onError: (error: any) => {
      onError?.(error)
    }
  })
} 