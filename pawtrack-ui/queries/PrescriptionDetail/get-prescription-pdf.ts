import { useQuery } from "@tanstack/react-query";

// Interface for the prescription PDF response
export interface PrescriptionPdfResponse {
  visitId: string;
  pdfBase64: string;
  fileName: string;
  generatedAt: string;
  patientName: string;
  clientName: string;
  complaintsSummary: string;
  prescriptionItemsCount: number;
}

const getPrescriptionPdf = async (visitId: string): Promise<PrescriptionPdfResponse | null> => {
  try {
    if (!visitId) {
      throw new Error("Visit ID is required");
    }
    
    const response = await fetch(`/api/PrescriptionDetail/visit/${visitId}/pdf`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch prescription PDF by visit ID");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching prescription PDF by visit ID:", error);
    throw error;
  }
};

export const useGetPrescriptionPdf = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['prescriptionPdf', 'visit', visitId],
    queryFn: () => getPrescriptionPdf(visitId),
    enabled: !!visitId && enabled,
  });
};

export default getPrescriptionPdf;
