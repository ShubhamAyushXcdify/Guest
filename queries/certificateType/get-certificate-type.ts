import { useQuery } from "@tanstack/react-query";

export interface CertificateType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const getCertificateTypes = async (): Promise<CertificateType[]> => {
  console.log("Fetching certificate types from /api/certificateType");
  const response = await fetch("/api/certificateType");
  if (!response.ok) {
    throw new Error("Failed to fetch certificate types");
  }
  return response.json();
};

export const useGetCertificateTypes = () => {
  return useQuery<CertificateType[], Error>({
    queryKey: ["certificateTypes"],
    queryFn: getCertificateTypes,
  });
};

