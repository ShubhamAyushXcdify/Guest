import { useQuery } from "@tanstack/react-query";

const getAppointmentByPatientId = async (patientId: string) => {
  try {
    const url = `/api/appointment/patient/${patientId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

export const useGetAppointmentByPatientId = (patientId: string) => {
  return useQuery({
    queryKey: ['appointment', 'patient', patientId],
    queryFn: () => getAppointmentByPatientId(patientId),
    enabled: !!patientId,
  })
}
