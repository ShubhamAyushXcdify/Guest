import { useQuery } from "@tanstack/react-query";
import { ClientRegistration } from "./create-registration";

export const getPendingClientRegistrations = async () => {
  const response = await fetch('/api/clientRegistration/pending');
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch pending client registrations');
  }
  
  const data = await response.json();
  return data as ClientRegistration[];
};

export function useGetPendingClientRegistrations(enabled = true) {
  return useQuery({
    queryKey: ['clientRegistrations', 'pending'],
    queryFn: getPendingClientRegistrations,
    enabled: enabled,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
