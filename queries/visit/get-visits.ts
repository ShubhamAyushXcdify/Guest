import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface Visit {
  id: string;
  appointmentId: string;
  isIntakeCompleted: boolean;
  isComplaintsCompleted: boolean;
  isMedicalHistoryCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const getVisits = async (
  pageNumber = 1, 
  pageSize = 10, 
  paginationRequired = true
): Promise<PaginatedResponse<Visit>> => {
  const response = await fetch(
    `/api/visit?pageNumber=${pageNumber}&pageSize=${pageSize}&paginationRequired=${paginationRequired}`
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch visits');
  }
  
  return response.json();
};

export const useGetVisits = (
  pageNumber = 1, 
  pageSize = 10, 
  paginationRequired = true, 
  enabled = true
) => {
  return useQuery({
    queryKey: ['visits', pageNumber, pageSize, paginationRequired],
    queryFn: () => getVisits(pageNumber, pageSize, paginationRequired),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  });
};
