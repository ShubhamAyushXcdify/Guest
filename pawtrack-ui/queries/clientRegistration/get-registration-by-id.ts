import { useQuery } from "@tanstack/react-query";
import { ClientRegistration } from "./create-registration";

export const getClientRegistrationById = async (id: string) => {
  if (!id) throw new Error('Client Registration ID is required');
  
  const response = await fetch(`/api/clientRegistration/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch client registration data');
  }
  
  const data = await response.json();
  return data as ClientRegistration;
};

export function useGetClientRegistrationById(id: string) {
  return useQuery({
    queryKey: ['clientRegistration', id],
    queryFn: () => getClientRegistrationById(id),
    enabled: !!id,
    retry: 1,
  });
}
