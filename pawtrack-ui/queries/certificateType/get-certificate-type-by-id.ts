import { useQuery } from "@tanstack/react-query";

interface CertificateType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const getCertificateTypeById = async (id?: string): Promise<CertificateType | null> => {
  if (!id) {
    return null;
  }

  const response = await fetch(`/api/certificateType/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch certificate type by ID");
  }

  return response.json();
};

export const useGetCertificateTypeById = (id?: string, enabled = true) => {
  return useQuery<CertificateType | null, Error>({ 
    queryKey: ["certificateType", { id }],
    queryFn: () => getCertificateTypeById(id),
    enabled: enabled && !!id,
  });
};


