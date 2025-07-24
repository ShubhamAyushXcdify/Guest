import { useQuery } from "@tanstack/react-query";

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  time: string;
}

export interface EmergencyVisitProcedure {
  id: string;
  visitId: string;
  procedureTime: string;
  ivCatheterPlacement: boolean;
  oxygenTherapy: boolean;
  cpr: boolean;
  woundCare: boolean;
  bandaging: boolean;
  defibrillation: boolean;
  bloodTransfusion: boolean;
  intubation: boolean;
  otherProcedure: boolean;
  otherProcedurePerformed: string;
  performedBy: string;
  medications: Medication[];
  fluidsType: string;
  fluidsVolumeMl: number;
  fluidsRateMlHr: number;
  responseToTreatment: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getEmergencyProcedures = async (): Promise<EmergencyVisitProcedure[]> => {
  const response = await fetch('/api/emergencyvisit/procedures');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency visit procedures");
  }
  return await response.json();
};

export function useGetEmergencyProcedures(enabled = true) {
  return useQuery({
    queryKey: ['emergencyProcedures'],
    queryFn: getEmergencyProcedures,
    enabled,
  });
} 