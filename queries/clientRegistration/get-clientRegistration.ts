import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ClientRegistration } from "./create-registration";

interface ClientRegistrationResponse {
  items: ClientRegistration[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const getClientRegistrations = async (
  pageNumber = 1,
  pageSize = 10,
  status = ''
) => {
  const url = `/api/clientRegistration?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch client registrations data');
  }
  
  const data = await response.json();
  return data as ClientRegistrationResponse;
};

export function useGetClientRegistrations(
  pageNumber = 1,
  pageSize = 10,
  status = '',
  enabled = true
) {
  return useQuery({
    queryKey: ['clientRegistrations', pageNumber, pageSize, status],
    queryFn: () => getClientRegistrations(pageNumber, pageSize, status),
    enabled: !!enabled,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });
}
