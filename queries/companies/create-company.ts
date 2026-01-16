import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Company } from "./get-company";

export interface CreateCompanyRequest {
  name: string;
  description: string;
  logoUrl: string;
  registrationNumber: string;
  email: string;
  phone: string;
  domainName: string; // Added domain field
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: string;
  privacyPolicy?: string; // Base64 encoded PDF
  termsOfUse?: string; // Base64 encoded PDF
}

const createCompany = async (companyData: CreateCompanyRequest): Promise<Company> => {
  const response = await fetch('/api/companies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create company');
  }

  return response.json();
};

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}