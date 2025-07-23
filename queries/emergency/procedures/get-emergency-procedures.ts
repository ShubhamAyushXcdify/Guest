import { useQuery } from "@tanstack/react-query";

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
  medicationName: string;
  medicationDose: string;
  medicationRoute: string;
  medicationTime: string;
  fluidsType: string;
  fluidsVolumeML: number;
  fluidsRateMLHr: number;
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