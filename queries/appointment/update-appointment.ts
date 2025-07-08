import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateAppointmentData {
  id: string;
  data: {
    isRegistered?: boolean;
    status?: string;
    rejectionReason?: string;
    appointmentDate?: string;
    reason?: string;
    notes?: string;
    roomId?: string;
    veterinarianId?: string;
    [key: string]: any; // Allow other properties
    sendEmail?: boolean;
  };
}

const updateAppointment = async ({ id, data }: UpdateAppointmentData) => {
  try {
    const url = `/api/appointment/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw result;
    }
    return result;
  } catch (error) {
    throw error;
  }
}

export const useUpdateAppointment = ({ onSuccess, onError }: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateAppointment,
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