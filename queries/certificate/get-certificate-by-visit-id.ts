import { useQuery } from "@tanstack/react-query";
import { CertificateDetails } from "./get-certificate-by-id";

const getCertificateByVisitId = async (visitId?: string): Promise<CertificateDetails[]> => {
  try {
    if (!visitId) {
      return []; // Return empty array if visitId is not provided
    }

    const response = await fetch(`/api/certificate/visit/${visitId}`);

    if (response.status === 404) {
      return []; // No certificate found, return empty array
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch certificate by visit ID");
    }
    const data = await response.json();

    // Ensure data is always an array
    if (Array.isArray(data)) {
        return data;
    }
    return [data]; // Wrap single object in an array
  } catch (error) {
    console.error("Error fetching certificate by visit ID:", error);
    return []; // Return empty array on error
  }
};
export function useGetCertificateByVisitId(visitId?: string, enabled = true) {
  return useQuery<CertificateDetails[]>({
    queryKey: ['certificate', 'visit', visitId],
    queryFn: () => getCertificateByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}