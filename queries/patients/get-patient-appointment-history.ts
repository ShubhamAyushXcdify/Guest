import { useQuery } from "@tanstack/react-query";

export interface AppointmentHistoryItem {
  appointmentId: string;
  visitId: string;
  appointmentDate: string;
  appointmentTimeFrom: string;
  appointmentTimeTo: string;
  appointmentType: string;
  status: string;
  reason: string;
  notes: string;
  veterinarianId: string;
  veterinarianName: string;
  clinicId: string;
  clinicName: string;
  roomId: string;
  roomName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientAppointmentHistoryResponse {
  patientId: string;
  patientName: string;
  appointmentHistory: AppointmentHistoryItem[];
}

async function getPatientAppointmentHistory(patientId: string): Promise<PatientAppointmentHistoryResponse> {
  if (!patientId) throw new Error("patientId is required");
  const res = await fetch(`/api/patient/appointment-history/${patientId}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch appointment history");
  }
  return res.json();
}

export function useGetPatientAppointmentHistory(patientId: string) {
  return useQuery<PatientAppointmentHistoryResponse>({
    queryKey: ["patientAppointmentHistory", patientId],
    queryFn: () => getPatientAppointmentHistory(patientId),
    enabled: !!patientId,
  });
}


