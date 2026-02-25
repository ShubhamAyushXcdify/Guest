import { useQuery } from "@tanstack/react-query";

export interface EmergencyDischargePrescription {
  emergencyDischargeId: string;
  visitId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyDischarge {
  id: string;
  visitId: string;
  dischargeStatus: string;
  dischargeTime: string;
  responsibleClinician: string;
  dischargeSummary: string;
  homeCareInstructions: string;
  followupInstructions: string;
  followupDate?: string;
  reviewedWithClient: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  prescriptions: EmergencyDischargePrescription[];
}

const getEmergencyDischargeById = async (id: string): Promise<EmergencyDischarge> => {
  if (!id) {
    throw new Error("Discharge ID is required");
  }
  const response = await fetch(`/api/emergency/discharge/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency discharge");
  }
  return await response.json();
};

export function useGetEmergencyDischargeById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['emergencyDischarge', id],
    queryFn: () => getEmergencyDischargeById(id),
    enabled: !!id && enabled,
  });
} 