import { useQuery } from "@tanstack/react-query";

export interface ProcedureDocumentDetails {
  id: string;
  procedureDetailId: string;
  procedureId: string;
  visitId: string;
  documentDetails: string;
  createdAt: string;
  updatedAt: string;
}

export const useProcedureDocumentDetails = (
  visitId?: string,
  procedureId?: string,
  enabled = true
) => {
  const fetchProcedureDocumentDetails = async (): Promise<ProcedureDocumentDetails | null> => {
    try {
      if (!visitId || !procedureId) {
        return null;
      }

      const response = await fetch(
        `/api/procedureDocumentationDetails/visit/${visitId}/procedure/${procedureId}`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch procedure documentation details"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching procedure documentation details:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["procedureDocumentationDetails", visitId, procedureId],
    queryFn: fetchProcedureDocumentDetails,
    enabled: enabled && !!visitId && !!procedureId,
  });
}; 