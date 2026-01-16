import { useQuery } from "@tanstack/react-query";

export interface CertificateDetails {
  id: string;
  visitId: string;
  certificateTypeId: string;
  certificateJson: string;
  createdAt: string;
  updatedAt: string;
}

export const useGetCertificateById = (
  certificateId?: string,
  enabled = true
) => {
  const fetchCertificateById = async (): Promise<CertificateDetails | null> => {
    try {
      if (!certificateId) {
        return null;
      }

      const response = await fetch(
        `/api/certificates/${certificateId}`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch certificate details by ID"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching certificate details by ID:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["certificateById", certificateId],
    queryFn: fetchCertificateById,
    enabled: enabled && !!certificateId,
  });
};
