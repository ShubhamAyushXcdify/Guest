import { useQuery } from "@tanstack/react-query";

export interface EmergencyVisitVital {
  id: string;
  visitId: string;
  weightKg?: number;
  capillaryRefillTimeSec?: number;
  mucousMembraneColor?: string;
  oxygenSaturationSpo2?: number;
  bloodGlucoseMgDl?: number;
  temperatureC?: number;
  heartRhythm?: string;
  heartRateBpm?: number;
  respiratoryRateBpm?: number;
  bloodPressure?: string;
  supplementalOxygenGiven?: boolean;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getEmergencyVitalById = async (id: string): Promise<EmergencyVisitVital> => {
  if (!id) {
    throw new Error("Vital detail ID is required");
  }
  const response = await fetch(`/api/emergency/vitals/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch emergency visit vital");
  }
  return await response.json();
};

export function useGetEmergencyVitalById(id: string, enabled = true) {
  return useQuery({
    queryKey: ['emergencyVital', id],
    queryFn: () => getEmergencyVitalById(id),
    enabled: !!id && enabled,
  });
} 