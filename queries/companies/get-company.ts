import { useQuery } from "@tanstack/react-query";

export interface Company {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}



const getCompanies = async () => {
  // Call the API without any parameters as the backend doesn't expect them
  const response = await fetch('/api/companies');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch companies data');
  }

  const data = await response.json();

  // Check if the API returns a single company object instead of an array
  // If so, wrap it in an array
  if (data && !Array.isArray(data)) {
    return [data] as Company[];
  }

  return data as Company[];
};

export function useGetCompanies(enabled = true) {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => getCompanies(),
    enabled: !!enabled,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export const getCompanyById = async (id: string) => {
  if (!id) throw new Error('Company ID is required');

  const response = await fetch(`/api/companies/${id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch company data');
  }

  const data = await response.json();
  return data as Company;
};

export function useGetCompanyById(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id),
    enabled: !!id,
    retry: 1,
  });
}