import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Company } from "./get-company";

export interface UpdateCompanyRequest {
  id: string;
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

const updateCompany = async (companyData: UpdateCompanyRequest): Promise<Company> => {
  const { id, ...updateData } = companyData;

  const response = await fetch(`/api/companies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update company');
  }

  return response.json();
};

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompany,
    onSuccess: (data) => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      // Update the specific company in cache
      queryClient.setQueryData(['company', data.id], data);
    },
  });
}