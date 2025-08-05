import { useQuery } from "@tanstack/react-query";

export interface CertificateDetails {
  id: string;
  visitId: string;
  certificateJson: string;
  createdAt: string;
  updatedAt: string;
}

export const useGetCertificateDetails = (
  visitId?: string,
  enabled = true
) => {
  const fetchCertificateDetails = async (): Promise<CertificateDetails | null> => {
    try {
      if (!visitId) {
        return null;
      }

      const response = await fetch(
        `/api/certificates/visit/${visitId}`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch certificate details"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["certificateDetails", visitId],
    queryFn: fetchCertificateDetails,
    enabled: enabled && !!visitId,
  });
};
