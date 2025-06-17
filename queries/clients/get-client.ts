import { useQuery } from "@tanstack/react-query";

export interface Client {
  id: string;
  clinicId: string;
  clinicName: string;
  firstName: string;
  lastName: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ClientResponse {
  items: Client[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const getClients = async (pageNumber = 1, pageSize = 10, clinicId = '') => {
  const response = await fetch(
    `/api/clients?pageNumber=${pageNumber}&pageSize=${pageSize}&clinicId=${clinicId}`
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch clients data');
  }
  
  const data = await response.json();
  return data as ClientResponse;
};

export function useGetClients(pageNumber = 1, pageSize = 10, clinicId = '') {
  return useQuery({
    queryKey: ['clients', pageNumber, pageSize, clinicId],
    queryFn: () => getClients(pageNumber, pageSize, clinicId),
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
}

export const getClientById = async (id: string) => {
  if (!id) throw new Error('Client ID is required');
  
  const response = await fetch(`/api/clients/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch client data');
  }
  
  const data = await response.json();
  return data as Client;
};

export function useGetClientById(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id),
    enabled: !!id,
    retry: 1,
  });
}

