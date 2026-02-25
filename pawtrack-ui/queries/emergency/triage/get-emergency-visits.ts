import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface EmergencyVisit {
  id: string;
  arrivalTime: string;
  triageNurseDoctor: string;
  triageCategory: string;
  painScore: number;
  allergies: string;
  immediateInterventionRequired: boolean;
  reasonForEmergency: string;
  triageLevel: string;
  presentingComplaint: string;
  initialNotes: string;
  createdAt: string;
  updatedAt: string;
  visitId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const getEmergencyVisits = async (
  pageNumber = 1, 
  pageSize = 10, 
  paginationRequired = true
): Promise<PaginatedResponse<EmergencyVisit>> => {
  const response = await fetch(
    `/api/emergency/triage?pageNumber=${pageNumber}&pageSize=${pageSize}&paginationRequired=${paginationRequired}`
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch emergency visits');
  }
  
  return response.json();
};

export const useGetEmergencyVisits = (
  pageNumber = 1, 
  pageSize = 10, 
  paginationRequired = true, 
  enabled = true
) => {
  return useQuery({
    queryKey: ['emergencyVisits', pageNumber, pageSize, paginationRequired],
    queryFn: () => getEmergencyVisits(pageNumber, pageSize, paginationRequired),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  });
}; 