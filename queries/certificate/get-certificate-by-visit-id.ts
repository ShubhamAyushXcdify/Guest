import { useQuery } from "@tanstack/react-query";
import { CertificateDetails } from "./get-certificate-by-id";

const getCertificateByVisitId = async (visitId?: string): Promise<CertificateDetails | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }

    const response = await fetch(`/api/certificate/visit/${visitId}`);

    if (response.status === 404) {
      return null; // No certificate found
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch certificate by visit ID");
    }
    const data = await response.json();

    if (Array.isArray(data)) {
        return data[data.length - 1] ?? null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching certificate by visit ID:", error);
    throw error;
  }
};
export function useGetCertificateByVisitId(visitId?: string, enabled = true) {
  return useQuery<CertificateDetails | null>({
    queryKey: ['certificate', 'visit', visitId],
    queryFn: () => getCertificateByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}