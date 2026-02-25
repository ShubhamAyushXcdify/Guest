import { useQuery } from "@tanstack/react-query";
import { Company } from "./get-company";

export const getCompanyBySubdomain = async (subdomain: string) => {
  if (!subdomain) throw new Error('Subdomain is required');

  const response = await fetch(`/api/companies/by-subdomain?subdomain=${subdomain}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch company data');
  }

  const data = await response.json();
  return data as Company;
};

export function useGetCompanyBySubdomain(subdomain: string) {
  return useQuery({
    queryKey: ['company', 'subdomain', subdomain],
    queryFn: () => getCompanyBySubdomain(subdomain),
    enabled: !!subdomain,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 